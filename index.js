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

var DB = require('./db').DB;
var parser = require("./grammar").parser;

var iotdb = require('iotdb')
var iotdb_transport = require('iotdb-transport')
var _ = iotdb._;

var connect = function(paramd, done) {
    paramd = _.defaults(paramd, {
        things_url: "iotdb://",
        recipes_url: "file://recipes",
    });

    var things_transporter;
    var recipes_transporter;

    var _connected = function() {
        if (done === null) {
            return;
        } 
        
        if (things_transporter === undefined) {
            return;
        } else if (recipes_transporter === undefined) {
            return;
        }

        return done(null, new DB(things_transporter, recipes_transporter));
    };

    iotdb_transport.connect(paramd.things_url, function(error, td) {
        if (error) {
            done(error);
            done = null;
            return;
        }

        things_transporter = td.transport;
        _connected();
    });

    if (!paramd.recipes_url) {
        recipes_transporter = null;
        _connected();
    } else {
        iotdb_transport.connect(paramd.recipes_url, function(error, td) {
            if (error) {
                done(error);
                done = null;
                return;
            }

            recipes_transporter = td.transport;
            _connected();
        });
    }
}

/**
 *  API
 *  connect is the main one you want
 */
exports.connect = connect;
exports.DB = DB;
exports.parse = parser.parse;
