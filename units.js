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

/**
 */
var units = function(paramd) {
    var value = paramd.av[0];
    var value_units = paramd.av[1];

    if (typed.is.Number(value)) {
        if (typed.is.Scalar(value)) {
            return new typed.Typed(typed.value(value), value_units);
        } else {
            var nscalar = _.convert.convert({
                from: typed.units(value), 
                to: value_units,
                value: typed.value(value),
            });
            return new typed.Typed(nscalar, value_units);
        }
    } else if (typed.is.Array(value)) {
        if (typed.is.Scalar(value)) {
            var nscalars = [];
            typed.value(value).map(function(v) {
                var nvalue = units({
                    first: v,
                    av: [ v, value_units ],
                    ad: {},
                });
                nscalars.push(nvalue.value);
            });
            return new typed.Typed(nscalars, value_units);
        } else {
            var nscalars = [];
            typed.value(value).map(function(v) {
                var nscalar = _.convert.convert({
                    from: typed.units(value), 
                    to: value_units,
                    value: v,
                });
                nscalars.push(nscalar);
            });
            return new typed.Typed(nscalars, value_units);
        }
    } else {
        return value;
    }
};

/**
 *  API
 */
exports.units = units;
