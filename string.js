/*
 *  string.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-07-19
 *
 *  Copyright [2013-2015] [David P. Janes]
 *
 *  String oriented functions
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

var iotdb = require('iotdb')
var _ = iotdb._;
var typed = require('./typed');

exports.d = {};

exports.d.upper = function(paramd) {
    if (typed.is.String(paramd.first)) {
        return paramd.first.toUpperCase();
    } else {
        return paramd.first;
    }
};

exports.d.lower = function(paramd) {
    if (typed.is.String(paramd.first)) {
        return paramd.first.toLowerCase();
    } else {
        return paramd.first;
    }
};

exports.d.split = function(paramd) {
    if (typed.is.String(paramd.first)) {
        var separator = paramd.ad.separator;
        if (separator === undefined) {
            separator = /\\s+/;
        }

        // not happy with this version - want something more python
        var maximum = paramd.ad.maximum;
        if (maximum === undefined) {
            maximum = Number.MAX_SAFE_INTEGER;
        }

        return paramd.first.split(separator, maximum);
    } else {
        return paramd.first;
    }
};

exports.d.join = function(paramd) {
    if (typed.is.Array(paramd.first)) {
        var separator = paramd.ad.separator;
        if (separator === undefined) {
            separator = " ";
        }

        return paramd.first.join(separator);
    } else {
        return paramd.first;
    }
};
