/*
 *  db_set.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-07-29
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
var logger = iotdb.logger({
    name: 'iotdb-iotql',
    module: 'db_set',
});

var operators = require("./operators");
var typed = require("./typed");
var units = require("./units");
var DB = require('./db').DB;

/**
 *  This does the 'SET' part
 */
DB.prototype.do_set = function (statement, rowd, callback) {
    var self = this;
    var nvalue;
    var ovalue;

    var resultds = [];
    var updated = {};

    var sets = _.ld.list(statement, "set", []);
    sets.map(function (setd, index) {
        var value = self.evaluate(setd.rhs, rowd);
        var band = setd.lhs.band;
        var selector = setd.lhs.selector;
        var assign = setd.assign;

        if (!band) {
            return callback(new Error("no band?"));
        } else if (["istate", "ostate", "meta", ].indexOf(band) === -1) {
            return callback(new Error("bad band: " + band));
        } else if (!selector) {
            return callback(new Error("no band selector?"));
        }

        var bd = updated[band];
        if (bd === undefined) {
            bd = {};
            updated[band] = bd;
        }

        var attr_code = null;
        var attr_unit = null;
        var attr = null;

        // selectors on state need to be looked up in the model
        if ((band === "istate") || (band === "ostate")) {
            var matches = [];
            var attributes = _.ld.list(rowd.model, "iot:attribute", []);
            attributes.map(function (attribute) {
                if (_.ld.contains(attribute, "iot:purpose", selector)) {
                    matches.push(attribute);
                }
            });

            if (matches.length) {
                var match_sensor = null;
                var match_actuator = null;

                for (var mi in matches) {
                    var match = matches[mi];
                    if (!match_sensor && _.ld.first(match, "iot:sensor")) {
                        match_sensor = match;
                    }
                    if (!match_actuator && _.ld.first(match, "iot:actuator")) {
                        match_actuator = match;
                    }
                }

                if ((band === "ostate") && match_actuator) {
                    attr = match_actuator;
                } else if ((band === "istate") && match_sensor) {
                    attr = match_sensor;
                } else if (match_actuator) {
                    attr = match_actuator;
                } else if (match_sensor) {
                    attr = match_sensor;
                } else {
                    attr = matches[0];
                }
            }

            if (attr) {
                attr_code = _.ld.first(attr, "@id", "");
                attr_code = attr_code.replace(/^.*?#/, '');

                attr_unit = _.ld.first(attr, "iot:unit", null);
            }
        } else {
            attr_code = selector;
        }



        if (attr_code === null) {
            logger.debug({
                method: "do_set",
                selector: selector,
                cause: "attribute may not apply to this Thing",
                thing_id: rowd.id,
            }, "code for attribute not found");
            return;
            // return callback(new Error("code for attribute not found: " + selector));
        }


        /*
         *  If there's a unit specified, we'll do a units
         *  conversion to make sure we're in the correct 
         *  unit space
         */
        if (attr_unit !== null) {
            nvalue = units.unit({
                av: [value, attr_unit]
            });
            value = typed.scalar(nvalue);
        } else if (_.is.Boolean(value) && attr) {
            var attr_minimum = _.ld.first(attr, "iot:minimum", null);
            var attr_maximum = _.ld.first(attr, "iot:maximum", null);
            if ((value === false) && (attr_minimum !== null)) {
                value = typed.scalar(attr_minimum);
            } else if ((value === true) && (attr_maximum !== null)) {
                value = typed.scalar(attr_maximum);
            } else {
                value = typed.scalar(value);
            }
        } else {
            // XXX - consider bringing in entire IOTDB conversion system
            value = typed.scalar(value);
        }

        if (assign === "&=") {
            ovalue = (rowd[band] || {})[attr_code];
            if (ovalue === undefined) {
                delete bd[attr_code];
            } else {
                nvalue = operators.d["&"]({
                    av: [ovalue, value]
                });
            }
        } else if (assign === "|=") {
            ovalue = (rowd[band] || {})[attr_code];
            if (ovalue === undefined) {
                nvalue = value;
            } else {
                nvalue = operators.d["|"]({
                    av: [ovalue, value]
                });
            }
        } else if (assign === "=") {
            nvalue = value;
        } else {
            throw new Error("unknown assign operator: " + assign);
        }

        if (nvalue === undefined) {
            delete bd[attr_code];
        } else {
            // magic for meta.facet - iot-facet:x.y.z also gets iot-facet:x.y and iot-facet:x
            if ((band === "meta") && (attr_code === "iot:facet")) {
                if (!_.is.Array(nvalue)) {
                    nvalue = [nvalue];
                }

                var adds = [];
                nvalue.map(function (v) {
                    if (!v.match(/^iot-facet:/)) {
                        return;
                    }

                    var parts = v.split(".");
                    for (var pi = 1; pi < parts.length; pi++) {
                        adds.push(parts.slice(0, pi).join("."));
                    }
                });

                nvalue = operators.d["|"]({
                    av: [nvalue, adds]
                });

                nvalue.sort();
            } else if (band === "meta") {}

            if (_.is.Dictionary(nvalue)) {
                throw new Error("nvalue should not be a Dictionary at this point");
            } else if (typed.is.Typed(nvalue)) {
                throw new Error("nvalue should not be Typed at this point");
            }

            bd[attr_code] = nvalue;
        }
    });

    callback(null, updated, rowd);
};

/**
 *  SET statement
 */
DB.prototype.run_statement_set = function (statement, callback) {
    var self = this;
    var view;

    var use_view = self.variable_get("_use_view");
    if (use_view) {
        view = self.viewd[use_view];
        if (!view) {
            return callback(new Error("VIEW not found: " + use_view), null);
        }

        statement.where = self.merge_where(view.where, statement.where);
    }

    view = self.viewd[statement.store];
    if (view) {
        statement.where = self.merge_where(view.where, statement.where);
        statement.store = "things";
    }

    self.prevaluate(statement);

    var transporter = self.stored[statement.store];
    if (!transporter) {
        return callback(new Error("store not found: " + statement.store));
    }

    var sets = _.ld.list(statement, "set", []);
    sets.map(function (column) {
        column.aggregate = null;
    });

    // run it
    var pending = 1;

    var _decrement = function () {
        if (--pending !== 0) {
            return;
        }

        if (callback) {
            callback(null, null);
        }

        callback = null;
    };

    var _wrap_callback = function (error, updatedd, rowd) {
        if (!callback) {
            return;
        } else if (error) {
            callback(error, null);
            callback = null;
        } else {
            if (updatedd) {
                for (var band in updatedd) {
                    var updated = updatedd[band];
                    if (_.is.Empty(updated)) {
                        continue;
                    }

                    ++pending;

                    updated = _.defaults(updated, rowd[band]);
                    _.timestamp.update(updated);

                    transporter.update({
                        id: rowd.id,
                        band: band,
                        value: updated,
                        user: self.user,
                    }, _decrement);
                }
            }

            _decrement();
        }
    };

    transporter.list({
        user: self.user,
    }, function (d) {
        if (d.end) {
            _wrap_callback(null, null);
        } else if (d.error) {
            _wrap_callback(d.error, null);
        } else {
            ++pending;
            self.fetch_bands(transporter, d.id, _.ld.list(statement.pre, "bands"), function (error, rowd) {
                if (!statement.where) {
                    self.do_set(statement, rowd, _wrap_callback);
                } else if (operators.is_true(self.evaluate(statement.where, rowd))) {
                    self.do_set(statement, rowd, _wrap_callback);
                } else {
                    _wrap_callback(null, null, null);
                }
            });
        }
    });
};
