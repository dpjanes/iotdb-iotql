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

var _update_pre = function(a, b) {
    a.query |= b.query;
    a.aggregate = a.aggregate || b.aggregate;
    _.ld.extend(a, "bands", b.bands);
};

var _list = function(a) {
    if (_.is.Array(a)) {
        return a;
    } else {
        return [ a ];
    }
}

var _true = function(a) {
    if (_.is.Equal(a, undefined)) {
        return false;
    } else if (_.is.Equal(a, null)) {
        return false;
    } else if (_.is.Equal(a, [])) {
        return false;
    } else if (_.is.Equal(a, {})) {
        return false;
    } else if (a === 0) {
        return false;
    } else if (a === false) {
        return false;
    } else if (a === "") {
        return false;
    } else {
        return true;
    }
};

var _compatible = function(a, b) {
    if (a === null) {
        return (b === null);
    } else if (_.is.String(a)) {
        return _.is.String(b);
    } else if (_.is.Number(a)) {
        return _.is.Number(b);
    } else {
        return false;
    }
}

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
            column.result = column.a_count;
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
            column.result = column.a_sum;
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
            column.result = column.a_sum / column.a_count;
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
            column.result = column.a_min;
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
            column.result = column.a_max;
        }
    },
};

/**
 *  These are functions that run on _each_
 *  item of the result set. Note there _is_
 *  overlap with 'aggregated'
 */
var operatord = {
    upper: function(first, operands) {
        if (_.is.String(first)) {
            return first.toUpperCase();
        } else {
            return first;
        }
    },
    maximum: function(first, operands) {
        if (_.is.Array(first)) {
            var max = null;
            first.map(function(value) {
                if (!_.is.Number(value)) {
                    return;
                }

                if (max === null) {
                    max = value;
                } else {
                    max = Math.max(max, value);
                }
            });
            return max;
        } else if (_.is.Number(first)) {
            return first;
        } else {
            return null;
        }
    },
    "=": function(first, operands) {
        if (operands.length !== 2) {
            return false;
        }
        return _.is.Equal(operands[0], operands[1]);
    },
    "!=": function(first, operands) {
        if (operands.length !== 2) {
            return false;
        }
        return !_.is.Equal(operands[0], operands[1]);
    },
    "<": function(first, operands) {
        if (operands.length !== 2) {
            return false;
        }
        return operands[0] < operands[1];
    },
    ">": function(first, operands) {
        if (operands.length !== 2) {
            return false;
        }
        return operands[0] > operands[1];
    },
    "<=": function(first, operands) {
        if (operands.length !== 2) {
            return false;
        }
        return operands[0] <= operands[1];
    },
    ">=": function(first, operands) {
        if (operands.length !== 2) {
            return false;
        }
        return operands[0] >= operands[1];
    },
    "in": function(first, operands) {
        if (operands.length !== 2) {
            return false;
        }
        return _list(operands[1]).indexOf(operands[0]) > -1;
    },
    "not in": function(first, operands) {
        if (operands.length !== 2) {
            return false;
        }
        return _list(operands[1]).indexOf(operands[0]) === -1;
    },
    "&": function(first, operands) {
        if (operands.length !== 2) {
            return false;
        }

        var as = _list(operands[0]);
        var bs = _list(operands[1]);
        var cs = [];

        as.map(function(v) {
            if ((cs.indexOf(v) === -1) && (bs.indexOf(v) !== -1)) {
                cs.push(v);
            }
        });

        return cs;
    },
    "|": function(first, operands) {
        if (operands.length !== 2) {
            return false;
        }

        var as = _list(operands[0]);
        var bs = _list(operands[1]);

        var cs = [];
        var handle = function(v) {
            if (cs.indexOf(v) === -1) {
                cs.push(v);
            }
        };

        as.map(handle);
        bs.map(handle);

        return cs;
    },
    "!": function(first, operands) {
        return !_true(first);
    },
    "and": function(first, operands) {
        if (operands.length !== 2) {
            return false;
        }

        if (!_true(operands[0])) {
            return false;
        }
        if (!_true(operands[1])) {
            return false;
        }

        return true;
    },
    "or": function(first, operands) {
        if (operands.length !== 2) {
            return false;
        }

        if (_true(operands[0])) {
            return true;
        }
        if (_true(operands[1])) {
            return true;
        }

        return false;
    },
    "count": function(first, operands) {
        if (_true(first)) {
            return 1;
        } else {
            return null;
        }
    },
    "avg": function(first, operands) {
        return first;
    },
    "sum": function(first, operands) {
        return first;
    },
    "max": function(first, operands) {
        return first;
    },
    "min": function(first, operands) {
        return first;
    },
}

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

            // selectors on state need to be looked up in the model
            if ((v.band === "istate") || (v.band === "ostate")) {
                var attributes = _.ld.list(rowd.model, "iot:attribute", []);
                attributes.map(function(attribute) {
                    if (code) {
                    } else if (_.ld.contains(attribute, "iot:purpose", v.selector)) {
                        code = _.ld.first(attribute, "@id", "");
                        code = code.replace(/^.*?#/, '');
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
            } else {
                return result;
            }
        } else {
            return null;
        }
    } else if (v.compute) {
        var operation = v.compute.operation;
        if (!operation) {
            throw new Error("missing operator");
        }

        var operator = operatord[operation];
        if (!operator) {
            throw new Error("operator not found: " + operation);
        }

        if (v.compute.star) {
            return operator(true, []);
        }

        var operands = [];
        v.compute.operands.map(function(operand) {
            operands.push(self.evaluate(operand, rowd));
        });

        if (operands.length === 0) {
            return operator(null, operands);
        } else {
            return operator(operands[0], operands);
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
        resultds.push({
            index: index,
            column: column,
            result: self.evaluate(column, rowd),
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
                    column.result = resultd.result;

                    if (column.pre.aggregate) {
                        column.pre.aggregate(resultd.result, column, WHEN_ITEM);
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
                        result: column.result,
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
    var updated = {};

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

        // selectors on state need to be looked up in the model
        if ((band === "istate") || (band === "ostate")) {
            var attributes = _.ld.list(rowd.model, "iot:attribute", []);
            attributes.map(function(attribute) {
                if (code) {
                } else if (_.ld.contains(attribute, "iot:purpose", selector)) {
                    code = _.ld.first(attribute, "@id", "");
                    code = code.replace(/^.*?#/, '');
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
