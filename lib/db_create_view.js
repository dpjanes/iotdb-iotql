/*
 *  db_create_view.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-10-01
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
    module: 'db_create_view',
});

var DB = require('./db').DB;

/**
 *  CREATE VIEW statement
 */
DB.prototype.run_statement_create_view = function (view_statement, callback) {
    var self = this;

    self.prevaluate(view_statement);

    // get transporter
    var store = view_statement.store || "things";
    var transporter = self.stored[store];
    if (!transporter) {
        return callback(new Error("store not found: " + store));
    }

    // save as a view
    var view_name = view_statement['create-view'].toLowerCase();
    self.viewd[view_name] = view_statement.where;

    return callback(null, null);
};
