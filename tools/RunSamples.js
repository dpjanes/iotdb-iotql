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

var iotdb = require('iotdb');
var _ = iotdb._;

var fs = require('fs');
var path = require('path');
var util = require('util');
var minimist = require('minimist');

var parser = require("../grammar/grammar").parser;
var DB = require('../lib/db').DB;
var helpers = require('../lib/helpers');
var iotql = require('../index');

var ad = require('minimist')(process.argv.slice(2), {
    boolean: ["write", "test", "all"],
});

/**
 *  Run the IoTQL program at the path
 */
DB.prototype.run_path = function (iotql_path, done) {
    var self = this;
    var statements;

    try {
        var iotql_script = fs.readFileSync(iotql_path, 'utf-8');
        statements = parser.parse(iotql_script);
    } catch (x) {
        console.log("%s: failed: %s", iotql_path, x);
        return done(x);
    }

    if (ad.test || ad.write) {
        self.run_path_test(iotql_path, statements, done);
    } else {
        self.run_path_user(iotql_path, statements, done);
    }
};

DB.prototype.run_path_test = function (iotql_path, statements, done) {
    var self = this;

    var name = path.basename(iotql_path);
    var text_path = path.join("samples", "output", name.replace(/[.]iotql/, ".txt"));

    // get the previous result if we need it
    var previous = null;

    if (ad.test) {
        try {
            previous = fs.readFileSync(text_path, 'utf-8');
        } catch (x) {}

        if (previous === null) {
            console.log("%s: missing", name);
            return;
        }
    }

    var lines = [];
    var rss = [];

    self.execute(statements, function (cd) {
        if (cd.end) {
            // var text = lines.join("\n") + "\n";
            rss.sort();
            var text = JSON.stringify(rss, null, 2);

            if (ad.write) {
                fs.writeFileSync(text_path, text);
                console.log("%s: ok: wrote", name, text_path);
            } else if (ad.test) {
                if (text !== previous) {
                    console.log("-----");
                    console.log("%s: changed", name);
                    console.log("------");
                    console.log("-- CURRENT");
                    console.log("------");
                    console.log("%s", text);
                    console.log("------");
                    console.log("-- PREVIOUS");
                    console.log("------");
                    console.log("%s", previous);
                    console.log("------");
                } else {
                    console.log("%s: ok", name);
                }
            }

            done(null);
        } else if (cd.start) {
            lines.push(util.format("============="));
            lines.push(util.format("== %s[%s]", name, cd.index));
            lines.push(util.format("============="));

        } else if (cd.error) {
            lines.push(util.format("-- ERROR: %s", cd.error));
            done(cd.error);
        } else if (cd.columns) {
            var rs = [];
            cd.columns.map(function (column, column_index) {
                // rs.push([ column.as, column.value, column.units ]);
                rs.push(column.as);
                rs.push(column.value);
                rs.push(column.units);
            });
            rss.push(rs);
            cd.columns.map(function (column, column_index) {
                var v = column.value;
                if (_.is.Array(v)) {
                    v = JSON.stringify(v);
                }

                if (column.units) {
                    lines.push(util.format("%s: %s [%s]", column.as, v, column.units));
                } else {
                    lines.push(util.format("%s: %s", column.as, v));
                }
            });
            lines.push(util.format("--"));
        }
    });
};

/**
 *  This executes the command and prints out the result to stdout
 */
DB.prototype.run_path_user = function (iotql_path, statements, done) {
    var self = this;
    var name = path.basename(iotql_path);

    self.execute(statements, function (cd) {
        if (cd.end) {
            done(null);
        } else if (cd.start) {
            console.log("=============");
            console.log("== %s[%s]", name, cd.index);
            console.log("=============");
        } else if (cd.error) {
            console.log("-- ERROR: %s", cd.error);
            done(cd.error);
        } else if (cd.columns) {
            // console.log(cd.columns);
            cd.columns.map(function (column, column_index) {
                var v = column.value;
                if (_.is.Array(v)) {
                    v = JSON.stringify(v);
                } else if (_.is.Object(v)) {
                    v = JSON.stringify(v);
                }


                // console.log("HERE:XXX", column);
                if (column.units) {
                    console.log("%s: %s [%s]", column.as, v, column.units);
                } else {
                    console.log("%s: %s", column.as, v);
                }
            });
            console.log("--");
        }
    });
};

// --- main ---
var iotql_paths = [];
if (ad.all) {
    var samples_dir = "samples";

    var names = fs.readdirSync(samples_dir);
    names.map(function (name) {
        if (!name.match(/[.]iotql$/)) {
            return;
        }

        iotql_paths.push(path.join("samples", name));
    });
} else if (ad._.length) {
    iotql_paths = ad._;
}

var connect_paramd = helpers.duplicate_samples("iotql-test");
iotql.connect(connect_paramd, function (error, db) {
    if (error) {
        throw error;
    }

    var run_next = function () {
        if (iotql_paths.length === 0) {
            process.nextTick(process.exit);
            return;
        }

        var iotql_path = iotql_paths[0];
        iotql_paths.splice(0, 1);

        helpers.duplicate_samples("iotql-test");
        db.stack_push();
        db.run_path(iotql_path, function () {
            db.stack_pop();
            run_next();
        });
    };

    run_next();
});
