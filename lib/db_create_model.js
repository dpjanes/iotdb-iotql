/*
 *  db_create_model.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-08-16
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
 *  CREATE MODEL statement
 */
DB.prototype.run_statement_create_model = function (statement, callback) {
    var self = this;

    self.prevaluate(statement);

    var model_code = _.id.to_dash_case(statement['create-model']);
    // console.log("MODEL", model_code);

    var mmaker = iotdb.make_model(model_code);
    var mpvd = {};

    statement['model-values'].map(function (mvd) {
        var lhs = self._model_evaluate(mvd.lhs);
        var rhs = self._model_evaluate(mvd.rhs);

        _.ld.add(mpvd, lhs, rhs);
    });

    for (var mkey in mpvd) {
        var mvalue = mpvd[mkey];
        mmaker.property_value(mkey, mvalue);
    }

    statement['attributes'].map(function (attribute) {
        var attribute_code = attribute.attribute;
        // console.log("ATTRIBUTE", attribute_code);

        var amaker = new iotdb.attribute.Attribute();
        amaker.code(attribute_code);

        var has_rw = false;
        attribute['attribute-values'].map(function (avd) {
            var lhs = self._model_evaluate(avd.lhs);
            var rhs = self._model_evaluate(avd.rhs);

            amaker.property_value(lhs, rhs);

            if ((lhs === "iot:read") || (lhs === "iot:write")) {
                has_rw = true;
            }

            // console.log("AVD", lhs, rhs);
        });

        if (!has_rw) {
            amaker.property_value("iot:read", true);
            amaker.property_value("iot:write", true);

        }

        amaker.make();
        mmaker.attribute(amaker);
    });


    var model = mmaker.make();
    var model_jsonld = (new model()).jsonld();

    self.emit("model", model_code, model_jsonld);

    callback(null, null);
};


DB.prototype._model_evaluate = function (d) {
    var self = this;

    if (d.band && d.selector) {
        if ((d.band === "iot") && (d.selector === "name") || (d.selector === "description") || (d.selector === "url") || (d.selector === "image")) {
            d.band = "schema";
        }

        return d.band + ":" + d.selector;
    } else if (d.actual !== undefined) {
        return d.actual;
    }

    console.log("D", d);
    throw new Error("not implemented");
};
