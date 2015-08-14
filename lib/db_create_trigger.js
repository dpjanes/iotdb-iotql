/*
 *  db_create_trigger.js
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

var util = require('util');

var logger = iotdb.logger({
    name: 'iotdb-iotql',
    module: 'db_create_trigger',
});

var operators = require("./operators");
var typed = require("./typed");
var units = require("./units");
var DB = require('./db').DB;

var __trigger_id = 0;

/**
 *  CREATE TRIGGER statement
 */
DB.prototype.run_statement_create_trigger = function (trigger_statement, callback) {
    var self = this;

    self.prevaluate(trigger_statement);

    var store = trigger_statement.store || "things";
    var transporter = self.stored[store];
    if (!transporter) {
        return callback(new Error("store not found: " + store));
    }


    /*
    self.decompile([ trigger_statement ], function(error, code) {
        if (error) {
            return callback(error);
        }
    */

    // 1. XXX - PERSIST HERE

    // 2. save as a scene (XXX - looks for old versions)
    trigger_statement.__trigger_id = ++__trigger_id;

    var scene_name = trigger_statement['create-trigger'].toLowerCase();
    self.scened[scene_name] = trigger_statement;

    var trigger_where = trigger_statement.where;
    var trigger_on = trigger_statement.on;

    // 3. look for things to happen!
    if (trigger_where) {
        self._monitor_trigger_where(store, transporter);
        callback(null, null);
    } else if (trigger_on) {
        callback(new Error("'on' not implemented (yet)"), null);
    } else {
        throw new Error("expected 'on' or 'where'");
    }
};

/**
 *  This waits around for rows to be modified, then
 *  sees if triggers have to be run against them
 */ 
DB.prototype._monitor_trigger_where = function(store, transporter) {
    var self = this;

    if (self._triggerd === undefined) {
        self._triggered = {};
    } else if (self._triggerd[store]) {
        return;
    } else {
        self._triggerd[store] = true;
    }

    transporter.updated(function(ud) {
        self.fetch_bands(transporter, ud.id, [ "istate", "ostate", "meta", "model" ], function (error, rowd) {
            if (error) {
                console.log("_monitor_trigger_where: cannot fetch bands: %s", _.error.message(error));
                return;
            }

            _.mapObject(self.scened, function(scene, scene_name) {
                if (!scene.where) {
                    return;
                }

                var scene_statements = scene['begin-end'];
                if (!scene_statements) {
                    console.log("_monitor_trigger_where: no begin-end?: %s", _.error.message(error));
                    return;
                }

                if (!operators.is_true(self.evaluate(scene.where, rowd))) {
                    return;
                }

                self.stack_push({});
                self.run_statements(scene_statements, function(error, v) {
                    self.stack_pop();
                });
            });
        });
    });
};
