/*
 *  db_connect_model.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-09-06
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
    module: 'db_let',
});

var operators = require("./operators");
var typed = require("./typed");
var units = require("./units");
var DB = require('./db').DB;

/**
 *  CONNECT MODEL statement
 */
DB.prototype.run_statement_connect_model = function (statement, callback) {
    var self = this;

    self.prevaluate(statement);

    var model_code = _.id.to_dash_case(statement['connect-model']);
    // console.log("MODEL", model_code);

    var mpvd = {};

    statement['model-values'].map(function(mvd) {
        var lhs = self._model_evaluate(mvd.lhs);
        var rhs = self._model_evaluate(mvd.rhs);

        _.ld.add(mpvd, lhs, rhs);
    });


    iotdb.connect(model_code, mpvd);

    callback(null, null);
};


DB.prototype._model_evaluate = function(d) {
    var self = this;

    if (d.band && d.selector) {
        return d.band + ":" + d.selector;
    } else if (d.actual) {
        return d.actual;
    } else if (d.selector) {
        return d.selector;  // this is actually the most expected value
    }

    console.log("D", d);
    throw new Error("not implemented");
};