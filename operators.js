/*
 *  operators.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-07-20
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

var iotdb = require('iotdb')
var _ = iotdb._;

var _list = function(a) {
    if (_.is.Array(a)) {
        return a;
    } else {
        return [ a ];
    }
}

var _true = function(a) {
    if (_.is.Equal(a, undefined)) {
        return false;
    } else if (_.is.Equal(a, null)) {
        return false;
    } else if (_.is.Equal(a, [])) {
        return false;
    } else if (_.is.Equal(a, {})) {
        return false;
    } else if (a === 0) {
        return false;
    } else if (a === false) {
        return false;
    } else if (a === "") {
        return false;
    } else {
        return true;
    }
};

var _compatible = function(a, b) {
    if (a === null) {
        return (b === null);
    } else if (_.is.String(a)) {
        return _.is.String(b);
    } else if (_.is.Number(a)) {
        return _.is.Number(b);
    } else {
        return false;
    }
}

exports.d = {
    "=": function(first, operands) {
        if (operands.length !== 2) {
            return false;
        }
        return _.is.Equal(operands[0], operands[1]);
    },
    "!=": function(first, operands) {
        if (operands.length !== 2) {
            return false;
        }
        return !_.is.Equal(operands[0], operands[1]);
    },
    "<": function(first, operands) {
        if (operands.length !== 2) {
            return false;
        }
        return operands[0] < operands[1];
    },
    ">": function(first, operands) {
        if (operands.length !== 2) {
            return false;
        }
        return operands[0] > operands[1];
    },
    "<=": function(first, operands) {
        if (operands.length !== 2) {
            return false;
        }
        return operands[0] <= operands[1];
    },
    ">=": function(first, operands) {
        if (operands.length !== 2) {
            return false;
        }
        return operands[0] >= operands[1];
    },
    "in": function(first, operands) {
        if (operands.length !== 2) {
            return false;
        }
        return _list(operands[1]).indexOf(operands[0]) > -1;
    },
    "not in": function(first, operands) {
        if (operands.length !== 2) {
            return false;
        }
        return _list(operands[1]).indexOf(operands[0]) === -1;
    },
    "&": function(first, operands) {
        if (operands.length !== 2) {
            return false;
        }

        var as = _list(operands[0]);
        var bs = _list(operands[1]);
        var cs = [];

        as.map(function(v) {
            if ((cs.indexOf(v) === -1) && (bs.indexOf(v) !== -1)) {
                cs.push(v);
            }
        });

        return cs;
    },
    "|": function(first, operands) {
        if (operands.length !== 2) {
            return false;
        }

        var as = _list(operands[0]);
        var bs = _list(operands[1]);

        var cs = [];
        var handle = function(v) {
            if (cs.indexOf(v) === -1) {
                cs.push(v);
            }
        };

        as.map(handle);
        bs.map(handle);

        return cs;
    },
    "!": function(first, operands) {
        return !_true(first);
    },
    "and": function(first, operands) {
        if (operands.length !== 2) {
            return false;
        }

        if (!_true(operands[0])) {
            return false;
        }
        if (!_true(operands[1])) {
            return false;
        }

        return true;
    },
    "or": function(first, operands) {
        if (operands.length !== 2) {
            return false;
        }

        if (_true(operands[0])) {
            return true;
        }
        if (_true(operands[1])) {
            return true;
        }

        return false;
    },
    "count": function(first, operands) {
        if (_true(first)) {
            return 1;
        } else {
            return null;
        }
    },
    "avg": function(first, operands) {
        return first;
    },
    "sum": function(first, operands) {
        return first;
    },
    "max": function(first, operands) {
        return first;
    },
    "min": function(first, operands) {
        return first;
    },
};
