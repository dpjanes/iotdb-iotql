/*
 *  db.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-07-16
 *
 *  Copyright [2013-2015] [David P. Janes]
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

"use strict";

var iotdb = require('iotdb');
var _ = iotdb._;

var util = require('util');
var events = require('events');
var async = require('async');

var logger = iotdb.logger({
    name: 'iotdb-iotql',
    module: 'db',
});


var parser = require("../grammar/grammar").parser;
var lib_string = require("./string");
var lib_math = require("./math");
var lib_debug = require("./debug");
var units = require("./units");
var operators = require("./operators");
var typed = require("./typed");

var _update_pre = function (a, b) {
    a.query |= b.query;
    a.aggregate = a.aggregate || b.aggregate;

    // can't just do it because ld.add will remove if empty!
    if (b.bands) {
        _.ld.add(a, "bands", b.bands);
    }
};

var WHEN_START = "start";
var WHEN_ITEM = "item";
var WHEN_END = "end";

/**
 *  These are functions that run over all items
 *  in the result set
 */
var aggregated = {
    count: function (item, column, when) {
        if (when === WHEN_START) {
            column.a_count = 0;
        } else if (when === WHEN_ITEM) {
            if ((item !== null) && (item !== undefined)) {
                column.a_count += 1;
            }
        } else if (when === WHEN_END) {
            column.value = column.a_count;
            column.units = null;
        }
    },

    sum: function (item, column, when) {
        if (when === WHEN_START) {
            column.a_sum = 0;
            column.units = null;
            column.error = null;
        } else if (when === WHEN_ITEM) {
            if (typed.is.Number(item)) {
                column.a_sum += typed.scalar(item);

                var i_units = typed.units(item);
                if (i_units) {
                    if (column.a_units && (column.a_units !== i_units)) {
                        column.a_error = util.format("units mismatch: %s %s", column.a_units, i_units);
                    }
                    column.a_units = i_units;
                }
            }
        } else if (when === WHEN_END) {
            column.value = column.a_sum;
            column.units = column.a_units;
            column.error = column.error || column.a_error;
        }
    },

    avg: function (item, column, when) {
        if (when === WHEN_START) {
            column.a_sum = 0;
            column.a_count = 0;
            column.a_error = null;
        } else if (when === WHEN_ITEM) {
            if (typed.is.Number(item)) {
                column.a_count += 1;
                column.a_sum += typed.scalar(item);

                var i_units = typed.units(item);
                if (i_units) {
                    if (column.a_units && (column.a_units !== i_units)) {
                        column.a_error = util.format("units mismatch: %s %s", column.a_units, i_units);
                    }
                    column.a_units = i_units;
                }
            }
        } else if (when === WHEN_END) {
            column.value = column.a_sum / column.a_count;
            column.units = column.a_units;
            column.error = column.error || column.a_error;
        }
    },

    min: function (item, column, when) {
        if (when === WHEN_START) {
            column.a_min = null;
            column.a_units = null;
            column.a_error = null;
        } else if (when === WHEN_ITEM) {
            if (item === null) {} else if (item === undefined) {} else if (column.a_min === null) {
                column.a_min = typed.scalar(item);
                column.a_units = typed.units(item);
            } else if (typed.is.Number(column.a_min) && typed.is.Number(item)) {
                var i_units = typed.units(item);
                if (i_units) {
                    if (column.a_units && (column.a_units !== i_units)) {
                        column.a_error = util.format("units mismatch: %s %s", column.a_units, i_units);
                    }
                    column.a_units = i_units;
                }

                column.a_min = Math.min(column.a_min, typed.scalar(item));
            } else if (typed.is.String(column.a_min) && typed.is.String(item)) {
                var i_scalar = typed.scalar(item);
                column.a_min = column.a_min < i_scalar ? column.a_min : i_scalar;
            }
        } else if (when === WHEN_END) {
            column.value = column.a_min;
            column.units = column.a_units;
            column.error = column.error || column.a_error;
        }
    },

    max: function (item, column, when) {
        if (when === WHEN_START) {
            column.a_max = null;
            column.a_units = null;
            column.a_error = null;
        } else if (when === WHEN_ITEM) {
            if (item === null) {} else if (item === undefined) {} else if (column.a_max === null) {
                column.a_max = typed.scalar(item);
                column.a_units = typed.units(item);
            } else if (typed.is.Number(column.a_max) && typed.is.Number(item)) {
                var i_units = typed.units(item);
                if (i_units) {
                    if (column.a_units && (column.a_units !== i_units)) {
                        column.a_error = util.format("units mismatch: %s %s", column.a_units, i_units);
                    }
                    column.a_units = i_units;
                }

                column.a_max = Math.max(column.a_max, typed.scalar(item));
            } else if (typed.is.String(column.a_max) && typed.is.String(item)) {
                var i_scalar = typed.scalar(item);
                column.a_max = column.a_max > i_scalar ? column.a_max : i_scalar;
            }
        } else if (when === WHEN_END) {
            column.value = column.a_max;
            column.units = column.a_units;
            column.error = column.error || column.a_error;
        }
    },
};

var operatord = _.defaults(
    operators.d, {
        string: lib_string.d,
        math: lib_math.d,
        debug: lib_debug.d,
        unit: units.unit,
    }
);

var DB = function (things_transporter, recipes_transporter) {
    this.transporter = things_transporter;
    this.stored = {
        "things": things_transporter,
    };
    if (recipes_transporter) {
        this.stored["recipes"] = recipes_transporter;
    }

    this.user = null;

    // this is temporary - we need to deal with SCOPE
    // LET
    this.variableds = [{}];

    // CREATE SCENE
    this.scened = {};

    // CREATE VIEW
    this.viewd = {};

    events.EventEmitter.call(this);
    this.setMaxListeners(0);
};
util.inherits(DB, events.EventEmitter);

/**
 */
DB.prototype.variable_set = function (name, value) {
    var self = this;
    var variabled = self.variableds[self.variableds.length - 1];

    variabled[name] = value;
};

/**
 */
DB.prototype.variable_get = function (name) {
    var self = this;
    var index = self.variableds.length;
    var value = null;

    while (--index >= 0) {
        var variabled = self.variableds[index];

        value = variabled[name];
        if (value !== undefined) {
            break;
        }
    }

    if (value === undefined) {
        value = null;
    }

    return value;
};

/**
 */
DB.prototype.stack_push = function (d) {
    var self = this;
    self.variableds.push(d || {});
};

/**
 */
DB.prototype.stack_pop = function () {
    var self = this;
    self.variableds.pop();

    if (self.variableds.length === 0) {
        throw new Error("internal error: too many stack pops");
    }
};

/**
 *  This goes though a definitions
 *  and figures out things about it. Safe
 *  to call multiple times.
 */
DB.prototype.prevaluate = function (v, paramd) {
    var self = this;

    paramd = _.defaults(paramd, {
        state: "istate",
    });

    if (v.pre !== undefined) {
        return;
    } else {
        v.pre = {
            aggregate: null,
            query: false,
            bands: [],
        };
    }

    if (v.where) {
        v.pre.query = true;
        self.prevaluate(v.where);
        _update_pre(v.pre, v.where.pre);
    }

    if (v.select) {
        _.ld.list(v, "select", []).map(function (column) {
            self.prevaluate(column, paramd);
            _update_pre(v.pre, column.pre);
        });
    }

    if (v.set) {
        _.ld.list(v, "set", []).map(function (set) {
            self.prevaluate(set, paramd);
            _update_pre(v.pre, set.pre);
        });
    }

    if (v.named && v.named.value) {
        self.prevaluate(v.named.value, paramd);
        _update_pre(v.pre, v.named.value.pre);
    }

    if (v.compute) {
        self.prevaluate(v.compute, paramd);
        _update_pre(v.pre, v.compute.pre);
    }

    if (v.operation) {
        v.operation = v.operation.toLowerCase();

        var aggregate = aggregated[v.operation];
        if (aggregate) {
            v.pre.aggregate = aggregate;
            v.pre.query = true;
        }
    }

    if (v.operands) {
        v.operands.map(function (operand) {
            self.prevaluate(operand, paramd);
            _update_pre(v.pre, operand.pre);
        });
    }

    if (v.list) {
        v.list.map(function (item) {
            self.prevaluate(item, paramd);
            _update_pre(v.pre, item.pre);
        });
    }

    if (v.rhs) {
        self.prevaluate(v.rhs, paramd);
        _update_pre(v.pre, v.rhs.pre);
    }

    if (v.lhs) {
        var o = paramd.state;
        paramd.state = "ostate";
        self.prevaluate(v.lhs, paramd);
        paramd.state = o;

        _update_pre(v.pre, v.lhs.pre);
    }

    if (v.actual) {}

    if (v.id) {
        v.pre.query = true;
    }

    if (v.select_all) {
        v.pre.query = true;
        v.pre.bands = ["state", "meta", "model"];
    }

    /*
    if (v["create-trigger"] && v.where) {
        var o = paramd.state;
        paramd.state = "istate";
        self.prevaluate(v.where, paramd);
        paramd.state = o;

        _update_pre(v.pre, v.where.pre);
    }
    */


    if (v.band) {
        if ((v.band === "state") && paramd.state) {
            v.oband = v.band;
            v.band = paramd.state;
        }

        if (["state", "istate", "ostate", "meta", "model"].indexOf(v.band) !== -1) {
            v.pre.query = true;
            _.ld.add(v.pre, "bands", v.band);

            if (v.selector && v.selector.length) {
                if (v.band === "meta") {
                    if (v.selector === "name") {
                        v.selector = "schema:name";
                    } else if (v.selector === "description") {
                        v.selector = "schema:description";
                    } else if (v.selector.indexOf(':') === -1) {
                        v.selector = "iot:" + v.selector;
                    } else if (v.selector.match(/^https?:\/\//)) {
                        v.selector = _.ld.compact(v.selector);
                    }
                } else if ((v.band === "istate") || (v.band === "ostate")) {
                    if (v.selector.indexOf(':') === -1) {
                        v.selector = "iot-purpose:" + v.selector;
                    } else if (v.selector.match(/^https?:\/\//)) {
                        v.selector = _.ld.compact(v.selector);
                    }
                }
            }
        } else if (v.selector) {
            v.actual = v.band + ":" + v.selector;
            v.band = null;
            v.selector = null;
        } else {}
    }
};

DB.prototype.evaluate = function (v, rowd) {
    var self = this;
    var cts;
    var t;
    var attributes;
    var result;

    if (rowd === undefined) {
        console.trace();
        throw new Error("called wrong");
    }

    if (v.actual !== undefined) {
        return v.actual;
    } else if (v.id) {
        return rowd.id;
    } else if (v.band) {
        var d = rowd[v.band];
        if (d === undefined) {
            return null;
        }

        if (v.all) {
            if ((v.band === "istate") || (v.band === "ostate")) {
                // we return the semantic columns, not the raw data
                // this means lots of ugly complexity and hacks
                cts = [];
                attributes = _.ld.list(rowd.model, "iot:attribute", []);
                attributes.map(function (attribute) {
                    code = _.ld.first(attribute, "@id", "");
                    code = code.replace(/^.*?#/, '');

                    unit = _.ld.first(attribute, "iot:unit", null);
                    purpose = _.ld.first(attribute, "iot:purpose", null);
                    if (purpose && purpose.match(/^iot-purpose:/)) {
                        purpose = purpose.replace(/^iot-purpose:/, '');
                    }


                    if ((v.band === "istate") && !_.ld.first(attribute, "iot:read")) {
                        return;
                    }

                    if ((v.band === "ostate") && !_.ld.first(attribute, "iot:write")) {
                        return;
                    }

                    result = d[code] || null;
                    if (result !== undefined) {
                        var ct = new typed.Typed(result, unit);
                        ct.purpose = purpose;
                        /* keep the real band name
                        if (v.oband) {
                            ct.as = v.oband + ":" + purpose;
                        } else {
                            ct.as = v.band + ":" + purpose;
                        }
                        */
                        ct.as = v.band + ":" + purpose;

                        cts.push(ct);
                    }
                });

                t = new typed.Typed(cts);
                t.expand_columns = true;
                return t;
            } else if (v.band === "meta") {
                cts = [];
                for (var key in d) {
                    if (key.match(/^@/)) {
                        continue;
                    }
                    var ct = new typed.Typed(d[key]);
                    if (key === "schema:name") {
                        ct.as = "meta:name";
                    } else if (key === "schema:description") {
                        ct.as = "meta:description";
                    } else if (key.match(/^iot:/)) {
                        ct.as = "meta:" + key.substring(4);
                    } else {
                        ct.as = "meta:" + key;
                    }
                    cts.push(ct);
                }

                t = new typed.Typed(cts);
                t.expand_columns = true;
                return t;
            }

            return d;
        }

        if (v.selector) {

            var code = null;
            var unit = null;
            var purpose = null;

            // selectors on state need to be looked up in the model
            if ((v.band === "istate") || (v.band === "ostate")) {
                attributes = _.ld.list(rowd.model, "iot:attribute", []);
                attributes.map(function (attribute) {
                    if (code) {} else if (_.ld.contains(attribute, "iot:purpose", v.selector)) {
                        code = _.ld.first(attribute, "@id", "");
                        code = code.replace(/^.*?#/, '');

                        unit = _.ld.first(attribute, "iot:unit", null);
                        purpose = _.ld.first(attribute, "iot:purpose", null);
                    }
                });

                if (code === null) {
                    return undefined; // e.g. this selector does not exist
                }
            } else {
                code = v.selector;
            }

            result = d[code];
            if (result === undefined) {
                return null;
            } else {
                var r = new typed.Typed(result, unit);
                r.purpose = purpose;
                r.as = v.column;
                return r;
            }
        } else {
            return null;
        }
    } else if (v.named) {} else if (v.compute) {
        var operation = v.compute.operation;
        if (!operation) {
            throw new Error("missing operator");
        }

        var od = operatord;
        var module = v.compute.module;
        if (module === "scene") {
            throw new Error("SCENEs cannot be selected, sorry - use DO");
        } else if (module) {
            od = od[module];
            if (!od) {
                throw new Error("module not found: " + module);
            } else if (!_.is.Dictionary(od)) {
                throw new Error("not a module: " + module);
            }
        }

        var operator = od[operation];
        if (!operator) {
            throw new Error("operator not found: " + operation);
        }

        if (_.is.Dictionary(operator)) {
            throw new Error("not an operastor: " + operation);
        }

        if (v.compute.star) {
            return operator({
                first: true,
                av: [],
                ad: {},
            });
        }

        var named = {};
        var operands = [];
        v.compute.operands.map(function (operand) {
            if (operand.named) {
                named[operand.named.key] = self.evaluate(operand.named.value, rowd);
            } else {
                operands.push(self.evaluate(operand, rowd));
            }
        });

        if (operands.length === 0) {
            return operator({
                av: operands,
                ad: named,
            });
        } else {
            if (operands[0] === undefined) {
                return undefined;
            }

            var first = operands[0];
            result = operator({
                first: first,
                av: operands,
                ad: named,
            });

            if (!(result && result._isTyped)) {
                result = new typed.Typed(result);
            }

            if (first && first.purpose) {
                result.purpose = first.purpose;
                result.as = first.as;
            }

            return result;
        }
    } else if (v.list) {
        var rs = [];
        v.list.map(function (value) {
            rs.push(self.evaluate(value, rowd));
        });
        return rs;
    } else if (v.select_all) {
        return rowd;
    } else if (v.variable) {
        var actual = self.variable_get(v.variable.variable);
        if (actual === undefined) {
            return null;
        }

        var vv = v.variable;

        if (!vv.band) {
            return actual;
        }

        if (!_.is.Dictionary(actual)) {
            return null;
        }

        if (vv.band.toLowerCase() === "id") {
            return _.ld.first(actual, "id");
        }

        // this prevaluate had to be delayed until here
        // because it's relative to actual, not some DB row
        self.prevaluate(vv);

        return self.evaluate(vv, actual);
    } else {
        console.log("THIS", v);
        throw new Error("not implemented");
    }
};

/**
 *  This executes a complete statement. The callback
 *  is called with (null, row-results) for each
 *  row, and then (null, null) when finished. If 
 *  an error is ever reported, we are finished
 *
 *  This is a mess of spaghetti code and should be split into
 *  separate functions for SET, SELECT, &c
 */
DB.prototype.run_statement = function (statement, callback) {
    var self = this;

    if (statement === undefined) {
        throw new Error("didn't expected undefined statement");
    } else if (_.is.Array(statement)) {
        throw new Error("didn't expected Array statement - maybe try 'run_statements'");
    }

    if (_.ld.first(statement, "create-scene")) {
        self.run_statement_create_scene(statement, callback);
    } else if (_.ld.first(statement, "create-rule")) {
        self.run_statement_create_rule(statement, callback);
    } else if (_.ld.first(statement, "create-model")) {
        self.run_statement_create_model(statement, callback);
    } else if (_.ld.first(statement, "create-view")) {
        self.run_statement_create_view(statement, callback);
    } else if (_.ld.first(statement, "connect-model")) {
        self.run_statement_connect_model(statement, callback);
    } else if (_.ld.first(statement, "connect-all")) {
        self.run_statement_connect_all(statement, callback);
    } else if (_.ld.first(statement, "use-view")) {
        self.run_statement_use_view(statement, callback);
    } else if (_.ld.first(statement, "select")) {
        self.run_statement_select(statement, callback);
    } else if (_.ld.first(statement, "set")) {
        self.run_statement_set(statement, callback);
    } else if (_.ld.first(statement, "let")) {
        self.run_statement_let(statement, callback);
    } else if (_.ld.first(statement, "do")) {
        self.run_statement_do(statement, callback);
    } else {
        throw new Error("expected LET, SET, CREATE or SELECT");
    }
};

/**
 */
DB.prototype.merge_where = function (where1, where2) {
    if (!where1) {
        return where2;
    }
    if (!where2) {
        return where1;
    }

    var rd = {};
    rd.compute = {
        operation: 'and',
        operands: [where1, where2],
        join: 'middle',
    };

    return rd;
};

/**
 *  Run a bunch of statements
 */
DB.prototype.run_statements = function (statements, callback) {
    var self = this;

    var scene_runs = [];
    statements.map(function (statements) {
        scene_runs.push(function (callback) {
            self.run_statement(statements, function (_error, _result) {
                if (_error) {
                    callback(_error, _result);
                } else if (_result === null) {
                    callback(_error, _result);
                }
            });
        });
    });

    async.series(scene_runs, function (error, result) {
        callback(error, null);
    });
};

/**
 *  This will get all the bands from the transporter,
 *  then when the data is in place, call the callback
 */
DB.prototype.fetch_bands = function (transporter, id, bands, callback) {
    var self = this;

    bands = _.clone(bands);

    if ((bands.indexOf('istate') > -1) || (bands.indexOf('ostate') > -1)) {
        bands.push("model");
    }

    var rowd = {
        id: id,
        istate: {},
        ostate: {},
        model: {},
        meta: {},
    };

    var band_count = 1;
    var _decrement_for_band = function () {
        if (--band_count === 0) {
            return callback(null, rowd);
        }
    };

    bands.map(function (band) {
        band_count++;

        transporter.get({
            id: id,
            band: band,
            user: self.user,
        }, function (gd) {
            if (gd.error) {
                throw new Error(gd.error);
            }
            if (gd.value) {
                rowd[band] = gd.value;
            }

            _decrement_for_band();
        });
    });

    _decrement_for_band();
};

/*
 *  Execute the compiled statements. The next statement
 *  won't execute until the previous one is completed.
 */
DB.prototype.execute = function (statements, callback) {
    var self = this;

    if (_.is.String(statements)) {
        statements = parser.parse(statements);
    }

    var statement_index = -1;

    var next = function () {
        if (++statement_index === statements.length) {
            callback({
                end: true,
            });
            return;
        }

        var statement = statements[statement_index];

        callback({
            start: true,
            index: statement_index,
            statement: statement,
        });

        self.run_statement(statement, function (error, columns) {
            callback({
                statement: statement,
                index: statement_index,
                error: error,
                columns: columns,
                end: error ? true : false,
            });

            if (error) {
                console.log("ERROR: %s", _.error.message(error));
                return;
            }

            if (!columns) {
                next();
            }
        });
    };

    next();
};

/**
 *  API
 */
exports.DB = DB;

require('./db_select');
require('./db_set');
require('./db_let');
require('./db_create_scene');
require('./db_create_rule');
require('./db_create_model');
require('./db_create_view');
require('./db_connect_model');
require('./db_connect_all');
require('./db_decompile');
require('./db_do');
require('./db_use_view');
