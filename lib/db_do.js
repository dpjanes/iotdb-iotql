/*
 *  do_do.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-07-30
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
    module: 'do_do',
});

var operators = require("./operators");
var typed = require("./typed");
var units = require("./units");
var DB = require('./db').DB;

/**
 *  DO statement
 */
DB.prototype.run_statement_do = function (do_statement, callback) {
    var self = this;

    self.prevaluate(do_statement);

    var scene_name = do_statement['do'].toLowerCase();
    var scene_statement = self.scened[scene_name];
    if (!scene_statement) {
        return callback(new Error("Not Found: " + scene_name), null);
    }

    var scene_statements = scene_statement['begin-end'];
    if (!scene_statements) {
        return callback(new Error("Not Found: " + scene_name), null);
    }

    var scene_parameter_nameds = scene_statement['parameters'];
    var scene_parameter_valueds = do_statement['operands'];
    var d = {};

    // named variables in the input get directly into the stack
    scene_parameter_valueds.map(function(scene_parameter_valued, index) {
        if (!scene_parameter_valued.named) {
            return;
        }

        var tvalue = self.evaluate(scene_parameter_valued.named.value, {});
        d["$" + scene_parameter_valued.named.key] = self.evaluate(scene_parameter_valued.named.value, {});
    });

    // match up parameters with values
    var fudge = 0;
    scene_parameter_nameds.map(function(scene_parameter_named, index) {
        var scene_parameter_valued = { actual: null };
        index += fudge;
        while (index < scene_parameter_valueds.length) {
            scene_parameter_valued = scene_parameter_valueds[index];
            if (scene_parameter_valued.named) {
                fudge++;
                index++;
            } else {
                break;
            }
        }


        var name = scene_parameter_named.variable;
        var tvalue = self.evaluate(scene_parameter_valued, {});

        d["$" + name] = tvalue; 
    });

    self.stack_push(d);
    self.run_statements(scene_statements, function(error, v) {
        self.stack_pop();
        callback(error, v);
    });
};
