/*
 *  RunSamples.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-07-13
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

var fs = require('fs')
var path = require('path')
var minimist = require('minimist');
var child_process = require('child_process');
var parser = require("./grammar").parser;
var FSTransport = require('iotdb-transport-fs').Transport

var ad = require('minimist')(process.argv.slice(2), {
    boolean: [ "write", "test", "all" ],
});


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

/**
 *  This goes though a SELECT column definitions
 *  and figures out things about it.
 */
var prevaluate = function(v, paramd) {
    if (v.pre !== undefined) {
        return;
    } else {
        v.pre = {
            aggregate: null,
            query: false,
            bands: [],
        };
    }

    if (v.compute) {
        prevaluate(v.compute, paramd);
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
            prevaluate(operand, paramd);
            _update_pre(v.pre, operand.pre);
        });
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

var evaluate = function(v, rowd) {
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
            operands.push(evaluate(operand, rowd));
        });

        if (operands.length === 0) {
            return operator(null, operands);
        } else {
            return operator(operands[0], operands);
        }
    } else if (v.list) {
        var rs = [];
        v.list.map(function(value) {
            rs.push(evaluate(value, rowd));
        });
        return rs;
    } else {
        console.log("THIS", v);
        throw new Error("not implemented");
    }
}

/**
 *  This does the select part for the particular row.
 *  The 'callback' function is called with (error, row-results)
 */
var do_select = function(statement, rowd, callback) {
    var resultds = [];

    var columns = _.ld.list(statement, "select");
    columns.map(function(column, index) {
        resultds.push({
            index: index,
            column: column,
            result: evaluate(column, rowd),
        });
    });

    callback(null, resultds)
};

/**
 *  This executes a complete statement. The callback
 *  is called with (null, row-results) for each
 *  row, and then (null, null) when finished. If 
 *  an error is ever reported, we are finished
 */
var run_statement = function(transporter, statement, callback) {
    var pre = {
        aggregate: null,
        query: false,
        bands: [],
    }

    if (statement.where) {
        pre.query = true;
        prevaluate(statement.where, {
            "state": "istate",
        });

        _update_pre(pre, statement.where.pre);
    }

    var columns = _.ld.list(statement, "select");
    columns.map(function(column) {
        prevaluate(column, {
            "state": "istate",
        });

        _update_pre(pre, column.pre);

        if (column.pre.aggregate) {
            column.pre.aggregate(null, column, WHEN_START);
        }
    });

    // if there's state involved, we need the model too
    if ((pre.bands.indexOf('istate') > -1) || (pre.bands.indexOf('ostate') > -1)) {
        _.ld.add(pre, "bands", "model");
    }

    if (pre.query) {
        var pending = 1;

        var _wrap_callback = function(error, resultds) {
            if (!callback) {
                return;
            } else if (error) {
                callback(error, null);
                callback = null;
            } else if (pre.aggregate)  {
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

        transporter.list(function(d) {
            if (d.end) {
                _wrap_callback(null, null);
                return;
            }

            pending++;

            var rowd = {
                id: d.id,
                istate: {},
                ostate: {},
                meta: {},
                units: {},
                facets: {},
            };

            var _do_if_match = function() {
                /*
                console.log("------");
                console.log("WHERE", statement.where);
                console.log("ROWD", rowd);
                 */
                if (!statement.where || evaluate(statement.where, rowd)) {
                    do_select(statement, rowd, _wrap_callback);
                } else {
                    _wrap_callback(null, null);
                }
            };

            // fetch all bands, then do the select
            var band_count = 1;
            var _decrement_for_band = function() {
                // console.log("HERE:BAND.1", band_count);
                if (--band_count === 0) {
                    _do_if_match();
                }
            };

            pre.bands.map(function(band) {
                band_count++;
                // console.log("HERE:BAND.2", band_count, d.id, band);
                transporter.get({
                    id: d.id,
                    band: band,
                }, function(gd) {
                    // console.log("HERE:BAND.3", band_count, d.id, band);
                    if (gd.value) {
                        rowd[band] = gd.value
                    }

                    _decrement_for_band();
                });
            });

            _decrement_for_band();
        });
    } else {
        do_select(statement, {
            id: null,
            istate: {},
            ostate: {},
            meta: {},
            units: {},
            facets: {},
        }, function(error, resultds) {
            if (error) {
                callback(error, resultds);
            } else {
                callback(error, resultds);
                callback(null, null);
            }
        });
    }
};

/**
 *  Run the IoTQL program at the path
 */
var run_path = function(transporter, iotql_path) {
    try {
        var iotql_script = fs.readFileSync(iotql_path, 'utf-8');
        var iotql_compiled = parser.parse(iotql_script);
    }
    catch (x) {
        console.log("%s: failed: %s", iotql_path, x);
        return;
    }

    var name = path.basename(iotql_path);
    var text_path = path.join("samples", "output", name.replace(/[.]iotql/, ".txt"));

    iotql_compiled.map(function(statement) {
        var resultdss = [];
        run_statement(transporter, statement, function(error, resultds) {
            if (error) {
                console.log("RESULT-ERROR", error, resultds);
                return;
            } else if (resultds) {
                resultdss.push(resultds);
                return;
            }

            var script = [ iotql_script.replace(/[ \n\t]*$/mg, ""), "------------", "-- RESULT --", "------------" ];
            var results = [];
            resultdss.map(function(resultds) {
                resultds.map(function(resultd) {
                    results.push("-- " + resultd.result);
                });
                results.push("--");
            });

            var text = results.join("\n") + "\n";

            if (ad.write) {
                fs.writeFileSync(text_path, text);
                console.log("%s: ok: wrote", name, text_path);
            } else if (ad.test) {
                var want = text;
                var got = null;
                try {
                    got = fs.readFileSync(text_path, 'utf-8');
                }
                catch (x) {
                }
                if (want !== got) {
                    console.log("-----");
                    console.log("%s: changed", name);
                    console.log("------");
                    console.log("-- WANT");
                    console.log("------");
                    console.log("%s", want);
                    console.log("------");
                    console.log("-- GOT");
                    console.log("------");
                    console.log("%s", got);
                    console.log("------");
                } else {
                    console.log("%s: ok", name);
                }
            } else {
                console.log("-- %s: ok", name);
                resultdss.map(function(resultds) {
                    console.log("--");
                    resultds.map(function(resultd, index) {
                        console.log("%s: %s", index, resultd.result);
                    });
                });
            }
        });
    });
};

// --- main ---
child_process.spawnSync("rm", [ "-rf", "samples/.things" ]);
child_process.spawnSync("cp", [ "-R", "samples/things", "samples/.things" ]);

var transporter = new FSTransport({
    prefix: "samples/.things",
});
if (ad.all) {
    var samples_dir = "samples";

    var names = fs.readdirSync(samples_dir);
    names.map(function(name) {
        if (!name.match(/[.]iotql$/)) {
            return;
        }

        run_path(transporter, path.join("samples", name));
    });
} else if (ad._.length) {
    ad._.map(function(iotql_path) {
        run_path(transporter, iotql_path);
    });
}
