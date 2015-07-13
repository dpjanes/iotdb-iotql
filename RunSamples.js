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
var parser = require("./grammar").parser;

var ad = require('minimist')(process.argv.slice(2), {
    boolean: [ "write", "test", "all" ],
});

var FSTransport = require('iotdb-transport-fs').Transport
var transporter = new FSTransport({
    prefix: "samples/things",
});

var _update_pre = function(a, b) {
    a.query |= b.query;
    a.aggregate |= b.aggregate;
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

/**
 *  These are functions that run over all items
 *  in the result set
 */
var aggregated = {
    count: function(item, scratch) {
    },

    avg: function(item, scratch) {
    },

    min: function(item, scratch) {
    },

    max: function(item, scratch) {
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
    max: function(first, operands) {
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
            aggregate: false,
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
        if ([ "count", "max", "min", "avg" ].indexOf(v.operation) > -1) {
            v.aggregate = true;
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
    });

    // if there's state involved, we need the model too
    if ((pre.bands.indexOf('istate') > -1) || (pre.bands.indexOf('ostate') > -1)) {
        _.ld.add(pre, "bands", "model");
    }

    if (pre.query) {
        var pending = 1;
        transporter.list(function(d) {
            if (d.end) {
                // console.log("HERE:DEC.1", pending);
                if (--pending === 0) {
                    callback(null, null);
                }

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

            var _wrap_callback = function(error, resultds) {
                if (!callback) {
                    return;
                } else if (error) {
                    callback(error, null);
                    callback = null;
                } else {
                    if (resultds !== null) {
                        callback(error, resultds);
                    }

                    // console.log("HERE:DEC.2", pending);
                    if (--pending === 0) {
                        callback(null, null);
                    }
                }
            };

            var _do_if_match = function() {
                /*
                console.log("------");
                console.log("WHERE", statement.where);
                console.log("ROWD", rowd);
                 */
                if (evaluate(statement.where, rowd)) {
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

    iotql_compiled.map(function(statement) {
        run_statement(transporter, statement, function(error, resultds) {
            console.log("RESULT", error, resultds);
        });
    });
};

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


/*


    var iotql_path = path.join("samples", name);
    var iotql_script = fs.readFileSync(iotql_path, 'utf-8');
    var json_path = path.join("samples", name.replace(/[.]iotql/, ".json"));

    try {
        var parsed = parser.parse(iotql_script);

        if (ad.write) {
            fs.writeFileSync(json_path, JSON.stringify(parsed, null, 2));
            console.log("%s: ok: wrote", name, json_path);
        } else if (ad.test) {
            var want = JSON.stringify(parsed, null, 2);
            var got = null;
            try {
                got = fs.readFileSync(json_path, 'utf-8');
            }
            catch (x) {
            }
            if (want !== got) {
                console.log(got, want);
                console.log("%s: changed", name);
            } else {
                console.log("%s: ok", name);
            }
        } else {
            console.log("%s: ok", name);
        }
    }
    catch (x) {
        console.log("%s: failed: %s", name, ( "" + x ).replace(/\n.*$/gm, ''));
    }
});
*/
