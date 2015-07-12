/*
 *  RunSamples.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-07-12
 *
 *  This will run the 
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

var write = false;

var ad = require('minimist')(process.argv.slice(2), {
    boolean: [ "write" ],
});



var names = fs.readdirSync("./samples")
names.map(function(name) {
    if (!name.match(/[.]iotql$/)) {
        return;
    }

    var in_path = path.join("samples", name);
    var out_path = path.join("samples", name.replace(/[.]iotql/, ".json"));
    var contents = fs.readFileSync(in_path, 'utf-8');

    try {
        var result = parser.parse(contents);
        console.log(name, "ok");

        if (ad.write) {
            fs.writeFileSync(out_path, JSON.stringify(result, null, 2));
        }
    }
    catch (x) {
        console.log(name, "failed:", ( "" + x ).replace(/\n.*$/gm, ''));
    }
});
