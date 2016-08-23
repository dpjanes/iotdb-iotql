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

const iotdb = require("iotdb");
const _ = iotdb._;

const canonical_json = require("canonical-json");

const logger = iotdb.logger({
    name: 'iotdb-iotql',
    module: 'db_let',
});

const operators = require("./operators");
const typed = require("./typed");
const units = require("./units");
const DB = require('./db').DB;

/**
 *  CREATE MODEL statement
 */
DB.prototype.run_statement_create_model = function (statement, callback) {
    const self = this;

    self.prevaluate(statement);

    const model_id = _.id.to_dash_case(statement['create-model']);
    const model = {
        "@id": "",
        "@type": "iot:Model",
        "@context": {
            "@base": "file:///" + model_id,
            "@vocab": "file:///" + model_id + "#",
        },
        "iot:model-id": model_id,
    };

    statement['model-values'].forEach(mvd => {
        const lhs = self._model_evaluate(mvd.lhs);
        const rhs = self._model_evaluate(mvd.rhs);

        _.ld.add(model, lhs, rhs);
    });

    model["iot:attribute"] = statement['attributes'].map(attribute => {
        const ad = {
            "@id": "#" + attribute.attribute,
            "@type": "iot:Attribute",
        };

        attribute['attribute-values'].forEach(function (avd) {
            const lhs = self._model_evaluate(avd.lhs);
            const rhs = self._model_evaluate(avd.rhs);

            _.ld.add(ad, lhs, rhs);
        });

        let is_sensor = _.ld.first(ad, "iot:sensor", null);
        let is_actuator = _.ld.first(ad, "iot:actuator", null);

        if ((is_sensor === null) || (is_actuator === null)) {
            is_sensor = true;
            is_actuator = true;
        } else if (is_sensor) {
            is_actuator = false;
        } else if (is_actuator) {
            is_sensor = false;
        }

        _.ld.set(ad, "iot:sensor", is_sensor);
        _.ld.set(ad, "iot:actuator", is_actuator);

        let is_read = _.ld.first(ad, "iot:read", null);
        let is_write = _.ld.first(ad, "iot:write", null);

        if ((is_read === null) || (is_write === null)) {
            is_read = is_sensor;
            is_write = is_actuator;
        } else if (is_read) {
            is_write = false;
        } else if (is_write) {
            is_read = false;
        }

        _.ld.set(ad, "iot:read", is_read);
        _.ld.set(ad, "iot:write", is_write);

        return ad;
    });

    self.emit("model", model_id, JSON.parse(canonical_json(model)));

    callback(null, null);
};


DB.prototype._model_evaluate = function (d) {
    const self = this;

    if (d.band && d.selector) {
        if ((d.band === "iot") && (d.selector === "name") || (d.selector === "description") || (d.selector === "url") || (d.selector === "image")) {
            d.band = "schema";
        }

        return d.band + ":" + d.selector;
    } else if (d.actual !== undefined) {
        return d.actual;
    }

    throw new Error("not implemented");
};
