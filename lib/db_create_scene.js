/*
 *  db_create_scene.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-07-29
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

var logger = iotdb.logger({
    name: 'iotdb-iotql',
    module: 'db_create_scene',
});

var operators = require("./operators");
var typed = require("./typed");
var units = require("./units");
var DB = require('./db').DB;

/**
 *  CREATE SCENE statement
 */
DB.prototype.run_statement_create_scene = function (statement, callback) {
    var self = this;

    self.prevaluate(statement);

    var machine_id = iotdb.keystore().get("/machine_id", null);
    if (!machine_id) {
        return callback("no 'machine_id' in keystore - make sure HomeStar is correctly set up");
    }

    var scene_name = statement['create-scene'].toLowerCase();

    self.scened[scene_name] = statement;
    callback(null, null);

    self.emit("scene", scene_name, {});
};
