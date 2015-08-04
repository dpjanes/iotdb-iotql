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
            attributes.map(function (attribute) {
                if (code) {} else if (_.ld.contains(attribute, "iot:purpose", selector)) {
                    code = _.ld.first(attribute, "@id", "");
                    code = code.replace(/^.*?#/, '');

                    unit = _.ld.first(attribute, "iot:unit", null);
                }
            });
        } else {
            code = selector;
        }

        if (code === null) {
            logger.error({
                method: "do_set",
                selector: selector,
                cause: "attribute may not apply to this Thing",
                thing_id: rowd.id,
            }, "code for attribute not found");
            return;
            // return callback(new Error("code for attribute not found: " + selector));
        }

        // DO CONVERSION HERE
        /*
         *  If there's a unit specified, we'll do a units
         *  conversion to make sure we're in the correct 
         *  unit space
         */
        if (unit !== null) {
            var nvalue = units.units({
                av: [value, unit]
            });
            value = typed.scalar(nvalue);
        }

        var nvalue;
        if (assign === "&=") {
            var ovalue = (rowd[band] || {})[code];
            if (ovalue === undefined) {
                delete bd[code];
            } else {
                nvalue = operators.d["&"]({
                    av: [ovalue, value]
                });
            }
        } else if (assign === "|=") {
            var ovalue = (rowd[band] || {})[code];
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
            delete bd[code];
        } else {
            // magic for meta.facet
            if ((band === "meta") && (code === "iot:facet")) {
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

            bd[code] = nvalue;
        }
    });

    callback(null, updated, rowd)
};

/**
 *  SET statement
 */
DB.prototype.run_statement_set = function (statement, callback) {
    var self = this;

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
                // console.log("RESULT!", updatedd, rowd);

                for (var band in updatedd) {
                    ++pending;

                    var updated = _.defaults(updatedd[band], rowd[band]);

                    transporter.update({
                        id: rowd.id,
                        band: band,
                        value: updated,
                    }, function (ud) {
                        _decrement();
                    });
                }
            }

            _decrement();
        }
    };

    transporter.list(function (d) {
        if (d.end) {
            _wrap_callback(null, null);
        } else if (d.error) {
            _wrap_callback(error, null);
        } else {
            ++pending;
            self.fetch_bands(transporter, d.id, statement.pre.bands, function (error, rowd) {
                // console.log("ROWD", rowd);
                if (!statement.where || self.evaluate(statement.where, rowd)) {
                    self.do_set(statement, rowd, _wrap_callback);
                } else {
                    _wrap_callback(null, null, null);
                }
            });
        }
    });
};
