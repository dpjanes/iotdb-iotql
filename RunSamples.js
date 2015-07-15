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
var DB = require('./db').DB;

var ad = require('minimist')(process.argv.slice(2), {
    boolean: [ "write", "test", "all" ],
});

/**
 *  Run the IoTQL program at the path
 */
DB.prototype.run_path = function(iotql_path) {
    var self = this;

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
        self.run_statement(statement, function(error, resultds) {
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
var db = new DB(transporter);

if (ad.all) {
    var samples_dir = "samples";

    var names = fs.readdirSync(samples_dir);
    names.map(function(name) {
        if (!name.match(/[.]iotql$/)) {
            return;
        }

        db.run_path(path.join("samples", name));
    });
} else if (ad._.length) {
    ad._.map(function(iotql_path) {
        db.run_path(iotql_path);
    });
}
