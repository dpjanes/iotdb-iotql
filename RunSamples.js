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
        if (operands.length === 2) {
            return _.is.Equal(operands[0], operands[1]);
        } else {
            return false;
        }
    },
    "!=": function(first, operands) {
        if (operands.length === 2) {
            return !_.is.Equal(operands[0], operands[1]);
        } else {
            return false;
        }
    },
    "<": function(first, operands) {
        if (operands.length === 2) {
            return operands[0] < operands[1];
        } else {
            return false;
        }
    },
    ">": function(first, operands) {
        if (operands.length === 2) {
            return operands[0] > operands[1];
        } else {
            return false;
        }
    },
    "<=": function(first, operands) {
        if (operands.length === 2) {
            return operands[0] <= operands[1];
        } else {
            return false;
        }
    },
    ">=": function(first, operands) {
        if (operands.length === 2) {
            return operands[0] >= operands[1];
        } else {
            return false;
        }
    },
}

/**
 *  This goes though a SELECT column definitions
 *  and figures out things about it.
 */
var prevaluate_column = function(v) {
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
        prevaluate_column(v.compute);
        _update_pre(v.pre, v.compute);
    }

    if (v.operation) {
        v.operation = v.operation.toLowerCase();
        if ([ "count", "max", "min", "avg" ].indexOf(v.operation) > -1) {
            v.aggregate = true;
        }
    }

    if (v.operands) {
        v.operands.map(function(operand) {
            prevaluate_column(operand);
            _update_pre(v.pre, operand.pre);
        });
    } 
    
    if (v.actual) {
    } 
    
    if (v.id) {
        v.pre.query = true;
    } 
    
    if (v.band) {
        if (v.band === "state") {
            v.band = "istate";
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
                        v.selctor = _.ld.compact(v.selector);
                    }
                } else if ((v.band === "istate") || (v.band === "ostate")) {
                    if (v.selector.indexOf(':') === -1) {
                        v.selector = "iot-attribute:" + v.selector;
                    } else if (v.selector.match(/^https?:\/\//)) {
                        v.selctor = _.ld.compact(v.selector);
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
            var result = d[v.selector];
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

var do_select_column = function(column, rowd) {
    return evaluate(column, rowd);
}

var do_select = function(statement, rowd) {
    var columns = _.ld.list(statement, "select");
    // console.log("HERE:XXX", rowd);

    var count = 0;
    columns.map(function(column) {
        ++count;
        var result = do_select_column(column, rowd);
        console.log("C" + count, result);
    });
};

var run_query = function(transporter, statement) {
    var pre = {
        query: false,
        bands: [],
    }

    if (statement.where) {
        pre.query = true;
    }

    var columns = _.ld.list(statement, "select");
    columns.map(function(column) {
        prevaluate_column(column);

        pre.query |= column.pre.query;
        _.ld.extend(pre, "bands", column.pre.bands);
    });

    if (pre.query) {
        transporter.list(function(d) {
            if (d.end) {
                return;
            }

            var rowd = {
                id: d.id,
                istate: {},
                ostate: {},
                meta: {},
                units: {},
                facets: {},
            };

            var count = pre.bands.length;
            if (count === 0) {
                do_select(statement, rowd);
            } else {
                var _decrement = function() {
                    if (--count === 0) {
                        do_select(statement, rowd);
                    }
                };
                pre.bands.map(function(band) {
                    transporter.get({
                        id: d.id,
                        band: band,
                    }, function(gd) {
                        if (gd.value) {
                            rowd[band] = gd.value
                        }

                        _decrement();
                    });
                });
            }
        });
    } else {
        do_select(statement, {
            id: null,
            istate: {},
            ostate: {},
            meta: {},
            units: {},
            facets: {},
        });
    }
};

var run_queries = function(transporter, iotql_compiled) {
    iotql_compiled.map(function(statement) {
        run_query(transporter, statement);
    });
    /*
    transporter.list(function(d) {
        console.log(d);
    });
    */
};

if (ad.all) {
    var samples_dir = "samples";

    var names = fs.readdirSync(samples_dir);
    names.map(function(name) {
        if (!name.match(/[.]iotql$/)) {
            return;
        }

        var iotql_path = path.join("samples", name);

        try {
            var iotql_script = fs.readFileSync(iotql_path, 'utf-8');
            var iotql_compiled = parser.parse(iotql_script);
        }
        catch (x) {
            console.log("%s: failed: %s", name, ( "" + x ).replace(/\n.*$/gm, ''));
            return;
        }

        run_queries(transporter, iotql_compiled);
    });
} else if (ad._.length) {
    ad._.map(function(iotql_path) {
        try {
            var iotql_script = fs.readFileSync(iotql_path, 'utf-8');
            var iotql_compiled = parser.parse(iotql_script);
        }
        catch (x) {
            console.log("%s: failed: %s", iotql_path, x);
            return;
        }

        run_queries(transporter, iotql_compiled);
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
