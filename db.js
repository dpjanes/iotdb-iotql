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

var iotdb = require('iotdb')
var _ = iotdb._;

var parser = require("./grammar").parser;
var string = require("./string");
var math = require("./math");
var units = require("./units");
var operators = require("./operators");
var typed = require("./typed");

var _update_pre = function(a, b) {
    a.query |= b.query;
    a.aggregate = a.aggregate || b.aggregate;
    _.ld.extend(a, "bands", b.bands);
};

var WHEN_START = "start";
var WHEN_ITEM = "item";
var WHEN_END = "end";

/**
 *  These are functions that run over all items
 *  in the result set
 */
var aggregated = {
    count: function(item, column, when) {
        if (when === WHEN_START) {
            column.a_count = 0;
        } else if (when === WHEN_ITEM) {
            if (_.is.Number(item)) {
                column.a_count += 1;
            }
        } else if (when === WHEN_END) {
            column.value = column.a_count;
            column.units = null;
        }
    },

    sum: function(item, column, when) {
        if (when === WHEN_START) {
            column.a_sum = 0;
        } else if (when === WHEN_ITEM) {
            if (_.is.Number(item)) {
                column.a_sum += item;
            }
        } else if (when === WHEN_END) {
            column.value = column.a_sum;
            column.units = null;
        }
    },

    avg: function(item, column, when) {
        if (when === WHEN_START) {
            column.a_sum = 0;
            column.a_count = 0;
        } else if (when === WHEN_ITEM) {
            if (_.is.Number(item)) {
                column.a_count += 1;
                column.a_sum += item;
            }
        } else if (when === WHEN_END) {
            column.value = column.a_sum / column.a_count;
            column.units = null;
        }
    },

    min: function(item, column, when) {
        if (when === WHEN_START) {
            column.a_min = null
        } else if (when === WHEN_ITEM) {
            if (item === null) {
            } else if (column.a_min === null) {
                column.a_min = item;
            } else if (_.is.Number(column.a_min) && _.is.Number(item)) {
                column.a_min = Math.min(column.a_min, item);
            } else if (_.is.String(column.a_min) && _.is.String(item)) {
                column.a_min = column.a_min < item ? column.a_min : item;
            }
        } else if (when === WHEN_END) {
            column.value = column.a_min;
            column.units = null;
        }
    },

    max: function(item, column, when) {
        if (when === WHEN_START) {
            column.a_max = null;
        } else if (when === WHEN_ITEM) {
            if (item === null) {
            } else if (column.a_max === null) {
                column.a_max = item;
            } else if (_.is.Number(column.a_max) && _.is.Number(item)) {
                column.a_max = Math.max(column.a_max, item);
            } else if (_.is.String(column.a_max) && _.is.String(item)) {
                column.a_max = column.a_max > item ? column.a_max : item;
            }
        } else if (when === WHEN_END) {
            column.value = column.a_max;
            column.units = null;
        }
    },
};

var operatord = _.defaults(
    operators.d,
    {
        string: string.d,
        math: math.d,
        units: units.units,
    }
);

var DB = function(transporter) {
    this.transporter = transporter;
};

/**
 *  This goes though a definitions
 *  and figures out things about it. Safe
 *  to call multiple times.
 */
DB.prototype.prevaluate = function(v, paramd) {
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
        _.ld.list(v, "select", []).map(function(column) {
            self.prevaluate(column, paramd);
            _update_pre(v.pre, column.pre);
        });
    }

    if (v.set) {
        _.ld.list(v, "set", []).map(function(set) {
            self.prevaluate(set, paramd);
            _update_pre(v.pre, set.pre);
        })
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
        v.operands.map(function(operand) {
            self.prevaluate(operand, paramd);
            _update_pre(v.pre, operand.pre);
        });
    } 

    if (v.list) {
        v.list.map(function(item) {
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

    if (v.actual) {
    } 
    
    if (v.id) {
        v.pre.query = true;
    } 
    
    if (v.band) {
        if ((v.band === "state") && paramd.state) {
            v.band = paramd.state;
        }

        if ([ "state", "istate", "ostate", "meta", "model" ].indexOf(v.band) !== -1) {
            v.pre.query = true;
            _.ld.add(v.pre, "bands", v.band);

            if (v.selector && v.selector.length) {
                if (v.band === "meta") {
                    if (v.selector === "name") {
                        v.selector = "schema:name";
                    } else if (v.selector.indexOf(':') === -1) {
                        v.selector = "iot:" + v.selector;
                    } else if (v.selector.match(/^https?:\/\//)) {
                        v.selector = _.ld.compact(v.selector);
                    }
                } else if ((v.band === "istate") || (v.band === "ostate")) {
                    if (v.selector.indexOf(':') === -1) {
                        v.selector = "iot-attribute:" + v.selector;
                    } else if (v.selector.match(/^https?:\/\//)) {
                        v.selector = _.ld.compact(v.selector);
                    }
                }
            } 
        } else if (v.band === "facets") {
            v.actual = "iot-facet:" + v.selector;
            v.band = null;
            v.selector = null;
        } else if (v.band === "units") {
            v.actual = "iot-unit:" + v.selector;
            v.band = null;
            v.selector = null;
        }
    } 
}

DB.prototype.evaluate = function(v, rowd) {
    var self = this;

    if (rowd === undefined) {
        console.trace();
        throw new Error("called wrong");
    }

    if (v.actual !== undefined) {
        return v.actual;
    } else if (v.id) {
        return rowd.id;
    } else if (v.band) {
        var d = rowd[v.band]
        if (d === undefined) {
            return null;
        }

        if (v.selector) {
            var code = null;
            var unit = null;

            // selectors on state need to be looked up in the model
            if ((v.band === "istate") || (v.band === "ostate")) {
                var attributes = _.ld.list(rowd.model, "iot:attribute", []);
                attributes.map(function(attribute) {
                    if (code) {
                    } else if (_.ld.contains(attribute, "iot:purpose", v.selector)) {
                        code = _.ld.first(attribute, "@id", "");
                        code = code.replace(/^.*?#/, '');

                        unit = _.ld.first(attribute, "iot:unit", null);
                    }
                });

                if (code === null) {
                    return null;
                }
            } else {
                code = v.selector;
            }

            var result = d[code];
            if (result === undefined) {
                return null;
            } else if (unit) {
                return new typed.Typed(result, unit);
            } else {
                return result;
            }
        } else {
            return null;
        }
    } else if (v.named) {
    } else if (v.compute) {
        var operation = v.compute.operation;
        if (!operation) {
            throw new Error("missing operator");
        }

        var od = operatord;
        var module = v.compute.module;
        if (module) {
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
        v.compute.operands.map(function(operand) {
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
            return operator({
                first: operands[0], 
                av: operands, 
                ad: named,
            });
        }
    } else if (v.list) {
        var rs = [];
        v.list.map(function(value) {
            rs.push(self.evaluate(value, rowd));
        });
        return rs;
    } else {
        console.log("THIS", v);
        throw new Error("not implemented");
    }
}

/**
 *  This executes a complete statement. The callback
 *  is called with (null, row-results) for each
 *  row, and then (null, null) when finished. If 
 *  an error is ever reported, we are finished
 *
 *  This is a mess of spaghetti code and should be split into
 *  separate functions for SET, SELECT, &c
 */
DB.prototype.run_statement = function(statement, callback) {
    var self = this;

    if (_.ld.list(statement, "select")) {
        self.run_statement_select(statement, callback);
    } else if (_.ld.list(statement, "set")) {
        self.run_statement_set(statement, callback);
    } else {
        throw new Error("expected SELECT or SET");
    }
}

/**
 *  This will get all the bands from the self.transporter,
 *  then when the data is in place, call the callback
 */
DB.prototype.fetch_bands = function(id, bands, callback) {
    var self = this;

    var bands = _.clone(bands);

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
    var _decrement_for_band = function() {
        if (--band_count === 0) {
            return callback(null, rowd);
        }
    };

    bands.map(function(band) {
        band_count++;
        self.transporter.get({
            id: id,
            band: band,
        }, function(gd) {
            if (gd.value) {
                rowd[band] = gd.value
            }

            _decrement_for_band();
        });
    });

    _decrement_for_band();
};

/**
 *  This does the select part for the particular row.
 *  The 'callback' function is called with (error, row-results)
 */
DB.prototype.do_select = function(statement, rowd, callback) {
    var self = this;

    var resultds = [];

    var columns = _.ld.list(statement, "select", []);
    columns.map(function(column, index) {
        var result = self.evaluate(column, rowd);
        resultds.push({
            index: index,
            column: column,
            value: typed.scalar(result),
            units: typed.units(result),
        });
    });

    callback(null, resultds)
};

/**
 *  This does SELECT
 */
DB.prototype.run_statement_select = function(statement, callback) {
    var self = this;

    self.prevaluate(statement);

    // fast mode
    if (!statement.pre.query) {
        self.do_select(statement, {
            id: null,
            istate: {},
            ostate: {},
            meta: {},
        }, function(error, resultds) {
            if (error) {
                callback(error, resultds);
            } else {
                callback(error, resultds);
                callback(null, null);
            }
        });
        return;
    }

    // query mode
    var columns = _.ld.list(statement, "select", []);
    columns.map(function(column) {
        if (column.pre.aggregate) {
            column.pre.aggregate(null, column, WHEN_START);
        }
    });

    var pending = 1;

    var _wrap_callback = function(error, resultds) {
        if (!callback) {
            return;
        } else if (error) {
            callback(error, null);
            callback = null;
        } else if (statement.pre.aggregate)  {
            if (resultds !== null) {
                resultds.map(function(resultd) {
                    var column = resultd.column;
                    column.value = resultd.value;

                    if (column.pre.aggregate) {
                        column.pre.aggregate(resultd.value, column, WHEN_ITEM);
                    }
                });
            }

            if (--pending === 0) {
                resultds = [];
                columns.map(function(column, index) {
                    if (column.pre.aggregate) {
                        column.pre.aggregate(null, column, WHEN_END);
                    }

                    resultds.push({
                        index: index,
                        value: column.value,
                        column: column,
                    });
                });

                callback(null, resultds);
                callback(null, null);
            }
        } else {
            if (resultds !== null) {
                callback(error, resultds);
            }

            if (--pending === 0) {
                callback(null, null);
            }
        }
    };

    self.transporter.list(function(d) {
        if (d.end) {
            _wrap_callback(null, null);
        } else if (d.error) {
            _wrap_callback(error, null);
        } else {
            pending++;

            self.fetch_bands(d.id, statement.pre.bands, function(error, rowd) {
                if (!statement.where || self.evaluate(statement.where, rowd)) {
                    self.do_select(statement, rowd, _wrap_callback);
                } else {
                    _wrap_callback(null, null);
                }
            });
        }
    });
};

/**
 *  This does the 'SET' part
 */
DB.prototype.do_set = function(statement, rowd, callback) {
    var self = this;

    var resultds = [];
    var updated = {
        id: rowd.id,
    };

    var sets = _.ld.list(statement, "set", []);
    sets.map(function(setd, index) {
        var value = self.evaluate(setd.rhs, rowd);
        var band = setd.lhs.band;
        var selector = setd.lhs.selector;

        if (!band) {
            return callback(new Error("no band?"));
        } else if ([ "istate", "ostate", "meta", ].indexOf(band) === -1) {
            return callback(new Error("bad band: " + band));
        } else if (!selector) {
            return callback(new Error("no band selector?"));
        }

        var bd = updated[band]
        if (bd === undefined) {
            bd = {};
            updated[band] = bd;
        }

        var code = null;
        var unit = null;

        // selectors on state need to be looked up in the model
        if ((band === "istate") || (band === "ostate")) {
            var attributes = _.ld.list(rowd.model, "iot:attribute", []);
            attributes.map(function(attribute) {
                if (code) {
                } else if (_.ld.contains(attribute, "iot:purpose", selector)) {
                    code = _.ld.first(attribute, "@id", "");
                    code = code.replace(/^.*?#/, '');

                    unit = _.ld.first(attribute, "iot:unit", null);
                }
            });
        } else {
            code = selector;
        }

        if (code === null) {
            return callback(new Error("code for attribute not found: " + selector));
        }

        bd[code] = value;
    });

    callback(null, updated)
};

/**
 *  SET statement
 */
DB.prototype.run_statement_set = function(statement, callback) {
    var self = this;

    self.prevaluate(statement);

    var sets = _.ld.list(statement, "set", []);
    sets.map(function(column) {
        column.aggregate = null;
    });

    // run it
    var pending = 1;

    var _wrap_callback = function(error, updatedd) {
        if (!callback) {
            return;
        } else if (error) {
            callback(error, null);
            callback = null;
        } else {
            if (updatedd) {
                console.log("RESULT!", updatedd);

                for (var band in updatedd) {
                    if (band === "id") {
                        continue;
                    }

                    ++pending;

                    var updated = updatedd[band];
                    self.transporter.update({
                        id: updatedd.id,
                        band: band, 
                        value: updated, 
                    }, function(ud) {
                        --pending;
                        console.log(ud);
                    });
                }
            }

            if (--pending === 0) {
                callback(null, null);
                callback = null;
            }
        }
    };

    self.transporter.list(function(d) {
        if (d.end) {
            _wrap_callback(null, null);
        } else if (d.error) {
            _wrap_callback(error, null);
        } else {
            ++pending;
            self.fetch_bands(d.id, statement.pre.bands, function(error, rowd) {
                if (!statement.where || self.evaluate(statement.where, rowd)) {
                    self.do_set(statement, rowd, _wrap_callback);
                } else {
                    _wrap_callback(null, null);
                }
            });
        }
    });
};

/**
 *  API
 */
exports.DB = DB;
