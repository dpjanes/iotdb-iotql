/*
 *  units.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-07-19
 *
 *  Copyright [2013-2015] [David P. Janes]
 *
 *  Unit conversion
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

var _precision = function(value, source) {
    source = "" + source;

    var p = 0;
    var dotx = source.indexOf('.')
    if (dotx !== -1) {
        p = source.length - p + 1;
    }

    return parseFloat(value.toFixed(Math.max(p, 3)));
}

var conversions = [
    {
        from: 'iot-unit:temperature.imperial.fahrenheit',
        to: 'iot-unit:temperature.si.celsius',
        convert: function(v) {
            return _precision(( v - 32 ) / 1.8, v);
        },
    },
    {
        from: 'iot-unit:temperature.si.celsius',
        to: 'iot-unit:temperature.imperial.fahrenheit',
        convert: function(v) {
            return _precision(v * 1.8 + 32, v);
        },
    },
    {
        from: 'iot-unit:temperature.si.celsius',
        to: 'iot-unit:temperature.si.kelvin',
        convert: function(v) {
            return v + 273.15;
        },
    },
    {
        from: 'iot-unit:temperature.si.kelvin',
        to: 'iot-unit:temperature.si.celsius',
        convert: function(v) {
            return v - 273.15;
        },
    },
];

/**
 */
var units = function(paramd) {
    var value = paramd.av[0];
    var value_units = paramd.av[1];

    if (typed.is.Number(value)) {
        if (typed.is.Scalar(value)) {
            return new typed.Typed(typed.value(value), value_units);
        } else {
            return new typed.Typed(convert(typed.units(value), value_units, typed.value(value)), value_units);
        }
    } else if (typed.is.Array(value)) {
        if (typed.is.Scalar(value)) {
            var nvalues = [];
            typed.value(value).map(function(v) {
                var nvalue = units({
                    first: v,
                    av: [ v, value_units ],
                    ad: {},
                });
                nvalues.push(nvalue.value);
            });
            return new typed.Typed(nvalues, value_units);
        } else {
            var nvalues = [];
            typed.value(value).map(function(v) {
                var nv = convert(typed.units(value), value_units, v);
                nvalues.push(nv);
            });
            return new typed.Typed(nvalues, value_units);
        }
    } else {
        return value;
    }
};

var convert = function(from, to, value) {
    if (from === to) {
        return value;
    }

    for (var ci in conversions) {
        var cd = conversions[ci];
        if ((cd.from !== from) || (cd.to !== to)) {
            continue;
        }

        return cd.convert(value);
    }

    throw new Error("no conversion found from '" + from + "' to '" + to + "'");
};

/**
 *  API
 */
exports.units = units;
exports.conversions = conversions;
