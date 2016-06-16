/*
 *  typed.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-07-20
 *
 *  Copyright [2013-2015] [David P. Janes]
 *
 *  This is for handling values that may have a units and/or scale
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

var _ = require('iotdb-helpers');

var Typed = function (scalar, units) {
    var self = this;

    this.scalar = scalar;
    this.units = (units === undefined) ? null : units;
    this.as = null;
    this.expand_columns = false;
};

Typed.prototype._isTyped = true;


var scalar = function (v) {
    if (v && v._isTyped) {
        return v.scalar;
    } else {
        return v;
    }
};

var units = function (v) {
    if (v && v._isTyped) {
        return v.units;
    } else {
        return null;
    }
};

// "is" functions equivalent to _.is.*
var is = {
    Scalar: function (v) {
        if (v && v._isTyped) {
            if (v.units) {
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    },
    Typed: function (v) {
        return v && v._isTyped;
    },
};
var _add_is = function (key, underlying) {
    is[key] = function (a, b) {
        return underlying(scalar(a), scalar(b));
    };
};

for (var key in _.is) {
    _add_is(key, _.is[key]);
}

/**
 *  API
 */
exports.Typed = Typed;
exports.scalar = scalar;
exports.units = units;
exports.is = is;
