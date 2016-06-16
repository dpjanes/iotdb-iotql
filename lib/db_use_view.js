/*
 *  db_use_view.js
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

var iotdb = require("iotdb");
var _ = require('iotdb-helpers');

var logger = iotdb.logger({
    name: 'iotdb-iotql',
    module: 'db_use_view',
});

var DB = require('./db').DB;

/**
 *  USE VIEW statement
 */
DB.prototype.run_statement_use_view = function (statement, callback) {
    var self = this;

    self.prevaluate(statement);

    self.variable_set('_use_view', statement['use-view']);

    callback(null, null);
};
