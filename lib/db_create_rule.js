/*
 *  db_create_rule.js
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
    module: 'db_create_rule',
});

var operators = require("./operators");
var typed = require("./typed");
var units = require("./units");
var DB = require('./db').DB;

var __rule_id = 0;

/**
 *  CREATE RULE statement
 */
DB.prototype.run_statement_create_rule = function (rule_statement, callback) {
    var self = this;

    self.prevaluate(rule_statement);

    // get transporter
    var store = rule_statement.store || "things";
    var transporter = self.stored[store];
    if (!transporter) {
        return callback(new Error("store not found: " + store));
    }

    rule_statement.__rule_id = ++__rule_id;

    // save as a scene
    var scene_name = rule_statement['create-rule'].toLowerCase();
    self.scened[scene_name] = rule_statement;

    // run the rule across all Things
    self._monitor_rule_first(store, transporter, scene_name);

    // actively start monitoring 
    if (rule_statement.where) {
        self._monitor_rule(store, transporter);
        return callback(null, null);
    } else {
        throw new Error("expected 'on' or 'where'");
    }
};

/**
 *  All rules get run against existing things once
 */
DB.prototype._monitor_rule_first = function (store, transporter, scene_name) {
    var self = this;

    if (self._rule_scene_onced === undefined) {
        self._rule_scene_onced = {};
    }

    self._rule_scene_onced[scene_name] = {};

    transporter.list(function (ld) {
        if (ld.end) {
            return;
        }

        var d = self._rule_scene_onced[scene_name];
        if (d[ld.id]) {
            return;
        }

        self._monitor_updated(store, transporter, ld);
    });
};

/**
 *  This waits around for rows to be modified, then
 *  sees if rules have to be run against them
 */
DB.prototype._monitor_rule = function (store, transporter) {
    var self = this;

    // make sure we are only monitoring once
    if (self._rule_store_monitoringd === undefined) {
        self._rule_store_monitoringd = {};
    }

    if (self._rule_store_monitoringd[store]) {
        return;
    }

    self._rule_store_monitoringd[store] = true;

    // monitor all changes 
    transporter.updated(function (ud) {
        self._monitor_updated(store, transporter, ud);
    });

    transporter.added(function (ud) {
        self._monitor_updated(store, transporter, ud);
    });
};

DB.prototype._monitor_updated = function (store, transporter, ud) {
    var self = this;

    self.fetch_bands(transporter, ud.id, ["istate", "ostate", "meta", "model"], function (error, rowd) {
        if (error) {
            console.log("_monitor_rule: cannot fetch bands: %s", _.error.message(error));
            return;
        }


        _.mapObject(self.scened, function (scene, scene_name) {
            if (!scene.where) {
                return;
            }

            self._rule_scene_onced[scene_name][ud.id] = true;

            var scene_statements = scene['begin-end'];
            if (!scene_statements) {
                console.log("_monitor_rule: no begin-end?: %s", _.error.message(error));
                return;
            }

            if (!operators.is_true(self.evaluate(scene.where, rowd))) {
                return;
            }

            self.stack_push({
                '$_': rowd,
            });
            self.run_statements(scene_statements, function (error, v) {
                self.stack_pop();
            });
        });
    });
};
