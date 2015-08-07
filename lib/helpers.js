#!/usr/bin/env node

/*
 *  utils.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-08-08
 *
 *  Copyright [2013-2014] [David P. Janes]
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

var repl = require('repl');
var path = require('path');
var mkdirp = require('mkdirp');
var os = require('os');
var util = require('util');
var child_process = require('child_process');

var minimist = require('minimist');
var FSTransport = require('iotdb-transport-fs').Transport

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'iotql',
    module: 'iotql',
});

/**
 *  Synchronous
 */
var duplicate_samples = function(name) {
    var connect_paramd = {};

    name = name || "iotql-samples";

    var tmp_root = path.join(process.env["HOME"], ".iotdb", name);
    mkdirp.sync(tmp_root);

    connect_paramd.folder = tmp_root;

    {
        var src_things_dir = path.join(__dirname, "..", "samples", "things");
        var dst_things_dir = path.join(tmp_root, "things");

        child_process.spawnSync("rm", [ "-rf", dst_things_dir ]);
        child_process.spawnSync("cp", [ "-R", src_things_dir, dst_things_dir ]);

        connect_paramd.things_url = dst_things_dir;
    }
    {
        var src_cookbooks_dir = path.join(__dirname, "..", "samples", "cookbooks");
        var dst_cookbooks_dir = path.join(tmp_root, "cookbooks");

        child_process.spawnSync("rm", [ "-rf", dst_cookbooks_dir ]);
        child_process.spawnSync("cp", [ "-R", src_cookbooks_dir, dst_cookbooks_dir ]);

        connect_paramd.recipes_url = "recipes://" + dst_cookbooks_dir;
    }

    return connect_paramd;
}

/**
 *  API
 */
exports.duplicate_samples = duplicate_samples;
