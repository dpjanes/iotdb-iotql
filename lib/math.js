/*
 *  math.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-07-19
 *
 *  Copyright [2013-2015] [David P. Janes]
 *
 *  Number functions
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
var typed = require('./typed');

exports.d = {};

exports.d.maximum = function (paramd) {
    if (typed.is.Array(paramd.first)) {
        var max = null;
        paramd.first.map(function (value) {
            if (!typed.is.Number(value)) {
                return;
            }

            var scalar = typed.scalar(value);

            if (max === null) {
                max = scalar;
            } else {
                max = Math.max(max, scalar);
            }
        });
        return max;
    } else if (typed.is.Number(paramd.first)) {
        return paramd.first;
    } else {
        return null;
    }
};

exports.d.minimum = function (paramd) {
    if (typed.is.Array(paramd.first)) {
        var max = null;
        paramd.first.map(function (value) {
            if (!typed.is.Number(value)) {
                return;
            }

            var scalar = typed.scalar(value);

            if (max === null) {
                max = scalar;
            } else {
                max = Math.max(max, scalar);
            }
        });
        return max;
    } else if (typed.is.Number(paramd.first)) {
        return paramd.first;
    } else {
        return null;
    }
};

exports.d.count = function (paramd) {
    if (typed.is.Array(paramd.first)) {
        var count = 0;
        paramd.first.map(function (value) {
            if (!typed.is.Number(value)) {
                return;
            }

            count++;
        });
        return count;
    } else if (typed.is.Number(paramd.first)) {
        return 1;
    } else {
        return null;
    }
};

exports.d.sum = function (paramd) {
    if (typed.is.Array(paramd.first)) {
        var sum = 0;
        paramd.first.map(function (value) {
            if (!typed.is.Number(value)) {
                return;
            }

            sum += typed.scalar(value);
        });
        return sum;
    } else if (typed.is.Number(paramd.first)) {
        return paramd.first;
    } else {
        return null;
    }
};

exports.d.average = function (paramd) {
    if (typed.is.Array(paramd.first)) {
        var sum = 0;
        var count = 0;
        paramd.first.map(function (value) {
            if (!typed.is.Number(value)) {
                return;
            }

            sum += typed.scalar(value);
            count += 1;
        });
        return sum / count;
    } else if (typed.is.Number(paramd.first)) {
        return paramd.first;
    } else {
        return null;
    }
};
