/*
 *  console.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-08-12
 *
 *  Copyright [2013-2015] [David P. Janes]
 *
 *  Console / logging functions
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
var typed = require('./typed');

exports.d = {};

exports.d.log = function (paramd) {
    console.log("CONSOLE.LOG", paramd);
};

exports.d.assert_same = function (paramd) {
    if (paramd.av.length !== 2) {
        throw new Error("expected exactly two arguments");
    }

    var a = paramd.av[0];
    var b = paramd.av[1];

    if (typed.is.Equal(a, b)) {
        return true;
    }

    throw new Error("assertion failed - arguments differ: '" + a + "' '" + b + "'");
};
