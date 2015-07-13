/*
 *  CompileSamples.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-07-12
 *
 *  This will compile the samples. If you add "--write"
 *  it will write out the JSON data. If you add "--test",
 *  it will test the current compiled data vs. the currently
 *  written data.
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

var fs = require('fs')
var path = require('path')
var minimist = require('minimist');
var parser = require("./grammar").parser;

var ad = require('minimist')(process.argv.slice(2), {
    boolean: [ "write", "test" ],
});

var samples_dir = "samples";

var names = fs.readdirSync(samples_dir);
names.map(function(name) {
    if (!name.match(/[.]iotql$/)) {
        return;
    }

    var iotql_path = path.join("samples", name);
    var json_path = path.join("samples", "compiled", name.replace(/[.]iotql/, ".json"));
    var contents = fs.readFileSync(iotql_path, 'utf-8');

    try {
        var result = parser.parse(contents);

        if (ad.write) {
            fs.writeFileSync(json_path, JSON.stringify(result, null, 2));
            console.log("%s: ok: wrote", name, json_path);
        } else if (ad.test) {
            var want = JSON.stringify(result, null, 2);
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
