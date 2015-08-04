/*
 *  db_decompile.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-07-29
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
 *  decompile code - i.e. turn our Javascript
 *  into IoTQL. This is needed for storing
 *  TRIGGERs, &c.
 */
DB.prototype.decompile = function (statements, callback) {
    var self = this;
    var results = [];

    statements.map(function (statement) {
        results.push(self._decompile(statement));
    });

    callback(null, results.join("\n"));
};

DB.prototype._decompile = function (fragment) {
    var self = this;
    var results = [];

    if (fragment.select) {
        results.push("SELECT");
        results.push(self._decompile_list_comma(fragment.select));
        results.push("FROM");
        results.push(fragment.store);
        results.push(";");
    } else if (fragment.actual !== undefined) {
        results.push(JSON.stringify(fragment.actual));
    } else if (fragment.id) {
        results.push("id");
    } else if (fragment.variable) {
        results.push(fragment.variable);
    } else if (fragment.band && fragment.selector) {
        results.push(fragment.band + ":" + fragment.selector);
    } else if (fragment.band && fragment.all) {
        results.push(fragment.band + ":*");
    } else if (fragment.select_all) {
        results.push("*");
    } else if (fragment.compute && fragment.compute.join === "middle") {
        results.push(self._decompile(fragment.compute.operands[0]));
        results.push(fragment.compute.operation);
        results.push(self._decompile(fragment.compute.operands[1]));
    } else if (fragment.compute && fragment.compute.join === "left") {
        results.push(fragment.compute.operation);
        results.push(self._decompile(fragment.compute.operands[0]));
    } else if (fragment.compute && fragment.compute.join === "function") {
        if (fragment.compute.module) {
            results.push(fragment.compute.module + ":" + fragment.compute.operation);
        } else {
            results.push(fragment.compute.operation);
        }
        if (fragment.compute.star) {
            results.push("(*)");
        } else {
            results.push("(");
            results.push(self._decompile_list_comma(fragment.compute.operands));
            results.push(")");
        }
    } else if (fragment.named) {
        results.push(fragment.named.key);
        results.push("=");
        results.push(self._decompile(fragment.named.value));
    } else if (fragment.list) {
        results.push("[");
        results.push(self._decompile_list_comma(fragment.list));
        results.push("]");
    } else if (fragment.set) {
        results.push("UPDATE");
        results.push(fragment.store);
        results.push("SET");
        results.push(self._decompile_list_comma(fragment.set));
        if (fragment.where) {
            results.push("WHERE");
            results.push(self._decompile(fragment.where));
        }
    } else if (fragment.lhs && fragment.rhs && fragment.assign) {
        results.push(self._decompile(fragment.lhs));
        results.push(fragment.assign);
        results.push(self._decompile(fragment.rhs));
    } else if (fragment.let && fragment.rhs) {
        results.push("LET");
        results.push(fragment.let);
        results.push("=");
        results.push(self._decompile(fragment.rhs));
    } else if (fragment['create-scene']) {
        results.push("CREATE SCENE");
        results.push(fragment['create-scene']);
        if (fragment.parameters && fragment.parameters.length) {
            results.push("(");
            results.push(self._decompile_list_comma(fragment.parameters));
            results.push(")");
        }
        results.push("BEGIN");
        results.push(self._decompile_list_comma(fragment['begin-end'], "; "));
        results.push("END");
    } else {
        console.log("HERE:XX", fragment);
        throw new Error("not implemented");
    }

    return results.join(" ");
};

DB.prototype._decompile_list_comma = function (fragments, joiner) {
    var self = this;
    var results = [];
    joiner = joiner || ", ";

    fragments.map(function (fragment, subindex) {
        results.push(self._decompile(fragment));
    });

    return results.join(joiner);
};
