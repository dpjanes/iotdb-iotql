/*
 *  db_select.js
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
    module: 'db_select',
});

var typed = require("./typed");
var operators = require("./operators");
var DB = require('./db').DB;

var WHEN_START = "start";
var WHEN_ITEM = "item";
var WHEN_END = "end";


/**
 *  This does the select part for the particular row.
 *  The 'callback' function is called with (error, row-results)
 */
DB.prototype.do_select = function (statement, rowd, callback) {
    var self = this;

    var resultds = [];

    var columns = _.ld.list(statement, "select", []);
    columns.map(function (column, index) {

        var result = self.evaluate(column, rowd);
        if (result === undefined) {
            return;
        }

        if (result && result.expand_columns) {
            typed.scalar(result).map(function (new_result) {
                resultds.push({
                    as: new_result.as,
                    index: index,
                    value: typed.scalar(new_result),
                    units: typed.units(new_result),
                });
            });
            return;
        }

        var as;
        if (column && column.column) {
            as = column.column;
        } else if (column.id) {
            as = "id";
        } else if (result && result.purpose) {
            as = result.purpose.replace(/^iot.*:/, '');
        } else if (column.selector) {
            as = column.selector.replace(/^iot.*:/, '');
        } else if (index === 0) {
            as = "c00";
        } else if (index < 10) {
            as = "c0" + index;
        } else {
            as = "c" + index;
        }

        resultds.push({
            as: as,
            index: index,
            column: column,
            value: typed.scalar(result),
            units: typed.units(result),
        });
    });

    callback(null, resultds);
};

/**
 *  This does SELECT
 */
DB.prototype.run_statement_select = function (statement, callback) {
    var self = this;
    var view;

    var use_view = self.variable_get("_use_view");
    if (use_view) {
        view = self.viewd[use_view];
        if (use_view) {
            statement.where = self.merge_where(view.where, statement.where);
        }
    }

    view = self.viewd[statement.store];
    if (view) {
        statement.where = self.merge_where(view.where, statement.where);
        statement.store = "things";
    }

    self.prevaluate(statement);

    // fast mode
    if (!statement.pre.query) {
        self.do_select(statement, {
            id: null,
            istate: {},
            ostate: {},
            meta: {},
        }, function (error, resultds) {
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
    columns.map(function (column) {
        if (column.pre.aggregate) {
            column.pre.aggregate(null, column, WHEN_START);
        }
    });

    var pending = 1;

    var _wrap_callback = function (error, resultds) {
        if (!callback) {
            return;
        } else if (error) {
            callback(error, null);
            callback = null;
        } else if (statement.pre.aggregate) {
            if (resultds !== null) {
                resultds.map(function (resultd) {
                    var column = resultd.column;
                    column.value = resultd.value;

                    if ((column._as === undefined) && resultd.as) {
                        column._as = resultd.as;
                    }

                    if (column.pre.aggregate) {
                        column.pre.aggregate(new typed.Typed(resultd.value, resultd.units), column, WHEN_ITEM);
                    }
                });
            }

            if (--pending === 0) {
                resultds = [];
                columns.map(function (column, index) {
                    if (column.pre.aggregate) {
                        column.pre.aggregate(null, column, WHEN_END);
                    }

                    if (column.error) {
                        // I have no idea what really should be done here
                        resultds.push({
                            as: column._as,
                            index: index,
                            value: null,
                            column: column,
                            error: column.error,
                        });
                    } else {
                        resultds.push({
                            as: column._as,
                            index: index,
                            value: column.value,
                            column: column,
                            units: column.units,
                        });
                    }
                });

                callback(null, resultds);
                callback(null, null);
            }
        } else {
            if (resultds !== null) {
                resultds.map(function (resultd) {
                    // don't let undefined leak out from here
                    if (resultd.value === undefined) {
                        resultd.value = null;
                    }
                });

                if (resultds.length > 0) {
                    callback(error, resultds);
                }
            }

            if (--pending === 0) {
                callback(null, null);
            }
        }
    };

    var transporter = self.stored[statement.store];
    if (!transporter) {
        return callback(new Error("store not found: " + statement.store));
    }

    transporter.list(function (d) {
        if (d.end) {
            _wrap_callback(null, null);
        } else if (d.error) {
            _wrap_callback(d.error, null);
        } else {
            pending++;

            self.fetch_bands(transporter, d.id, statement.pre.bands, function (error, rowd) {
                if (!statement.where || operators.is_true(self.evaluate(statement.where, rowd))) {
                    self.do_select(statement, rowd, _wrap_callback);
                } else {
                    _wrap_callback(null, null);
                }
            });
        }
    });
};
