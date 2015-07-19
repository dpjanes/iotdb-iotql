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

exports.d = {};

exports.d.upper = function(first, operands) {
    if (_.is.String(first)) {
        return first.toUpperCase();
    } else {
        return first;
    }
};

exports.d.lower = function(first, operands) {
    if (_.is.String(first)) {
        return first.toLowerCase();
    } else {
        return first;
    }
};

exports.d.split = function(first, operands, ad) {
    if (_.is.String(first)) {
        var separator = ad.separator;
        if (separator === undefined) {
            separator = /\\s+/;
        }

        // not happy with this version - want something more python
        var maximum = ad.maximum;
        if (maximum === undefined) {
            maximum = Number.MAX_SAFE_INTEGER;
        }

        return first.split(separator, maximum);
    } else {
        return first;
    }
};

exports.d.join = function(first, operands, ad) {
    if (_.is.Array(first)) {
        var separator = ad.separator;
        if (separator === undefined) {
            separator = " ";
        }

        return first.join(separator);
    } else {
        return first;
    }
};
