/*
 *  index.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-07-04
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

var DB = require('./lib/db').DB;
var parser = require("./grammar/grammar").parser;

var fs = require('fs');

var iotdb = require('iotdb');
var iotdb_transport = require('iotdb-transport');
var _ = iotdb._;

var connect = function (paramd, done) {
    done(null, new DB(iotdb_transport.make({}), null));
};

/**
 *  API
 *  connect is the main one you want - it will pass 
 *  back a 'db' that you can then call 
 */
exports.connect = connect;
exports.DB = DB;
exports.parse = parser.parse;
