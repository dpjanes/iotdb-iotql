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

var logger = iotdb.logger({
    name: 'iotdb-iotql',
    module: 'db_create_trigger',
});

var operators = require("./operators");
var typed = require("./typed");
var units = require("./units");
var DB = require('./db').DB;

/**
 *  LET statement
 */
DB.prototype.run_statement_create_trigger = function (statement, callback) {
    var self = this;

    self.prevaluate(statement);

    console.log("CREATE TRIGGER.1", statement);

    self.decompile(statement['begin-end'], function (error, code) {
        console.log("CREATE TRIGGER.2", code);
    });

    /*
    var variable = _.ld.first(statement, "let");
    var value = self.evaluate(statement.rhs, {
        id: null,
        istate: {},
        ostate: {},
        meta: {},
    });

    self.variabled[variable] = value
    */

    callback(new Error("not implemented"), null);
};
