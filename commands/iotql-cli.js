/*
 *  bin/commands/iotql-cli.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-12-17
 *
 *  Run the IoTQL command line. The advantage of this
 *  over the "bin" version is that this runs with the locally
 *  installed IOTDB module, rather than the _globally_
 *  installed IOTDB module.
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
var _ = iotdb.helpers;
var cfg = iotdb.cfg;

var fs = require('fs');
var path = require('path');
var child_process = require('child_process')

exports.command = "iotql-cli";
exports.summary = "start the IoTQL command line";

exports.help = function () {
    console.log("usage: homestar iotql-cli");
    console.log("");
    console.log("Start your local Home☆Star Runner");
};

exports.run = function (ad) {
    var node_path = process.execPath;
    var app_path = path.join(__dirname, "..", "bin", "iotql");
    var argv = [ app_path ].concat(ad._.slice(0));

    child_process.spawn(node_path, argv, {
        stdio: 'inherit'
    });
};
