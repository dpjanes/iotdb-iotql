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

var _ = require('iotdb-helpers');
var typed = require('./typed');
var units = require('./units');

var _list = function (a) {
    a = typed.scalar(a);
    if (typed.is.Array(a)) {
        return a;
    } else {
        return [a];
    }
};

var _true = function (a) {
    a = typed.scalar(a);
    if (typed.is.Equal(a, undefined)) {
        return false;
    } else if (typed.is.Equal(a, null)) {
        return false;
    } else if (typed.is.Equal(a, [])) {
        return false;
    } else if (typed.is.Equal(a, {})) {
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

var _compatible = function (a, b) {
    if (a === null) {
        return (b === null);
    } else if (typed.is.String(a)) {
        return typed.is.String(b);
    } else if (typed.is.Number(a)) {
        return typed.is.Number(b);
    } else {
        return false;
    }
};

exports.d = {
    "=": function (paramd) {
        if (paramd.av.length !== 2) {
            return false;
        }

        var a = paramd.av[0];
        var b = paramd.av[1];

        return typed.is.Equal(paramd.av[0], paramd.av[1]);
    },
    "!=": function (paramd) {
        if (paramd.av.length !== 2) {
            return false;
        }

        var a = paramd.av[0];
        var b = paramd.av[1];

        return !typed.is.Equal(paramd.av[0], paramd.av[1]);
    },
    "<": function (paramd) {
        if (paramd.av.length !== 2) {
            return false;
        }

        var a = paramd.av[0];
        var b = paramd.av[1];
        if (typed.is.Null(a)) {
            return false;
        } else if (typed.is.Null(b)) {
            return false;
        }


        return typed.scalar(a) < typed.scalar(units.similar(a, b));
    },
    ">": function (paramd) {
        if (paramd.av.length !== 2) {
            return false;
        }

        var a = paramd.av[0];
        var b = paramd.av[1];
        if (typed.is.Null(a)) {
            return false;
        } else if (typed.is.Null(b)) {
            return false;
        }

        return typed.scalar(a) > typed.scalar(units.similar(a, b));
    },
    "<=": function (paramd) {
        if (paramd.av.length !== 2) {
            return false;
        }

        var a = paramd.av[0];
        var b = paramd.av[1];
        if (typed.is.Null(a)) {
            return false;
        } else if (typed.is.Null(b)) {
            return false;
        }

        return typed.scalar(a) <= typed.scalar(units.similar(a, b));
    },
    ">=": function (paramd) {
        if (paramd.av.length !== 2) {
            return false;
        }

        var a = paramd.av[0];
        var b = paramd.av[1];
        if (typed.is.Null(a)) {
            return false;
        } else if (typed.is.Null(b)) {
            return false;
        }

        return typed.scalar(a) >= typed.scalar(units.similar(a, b));
    },
    // XXX list functions are not properly dealing with typed values
    "in": function (paramd) {
        if (paramd.av.length !== 2) {
            return false;
        }

        return _list(paramd.av[1]).indexOf(typed.scalar(paramd.av[0])) > -1;
    },
    "not in": function (paramd) {
        if (paramd.av.length !== 2) {
            return false;
        }
        return _list(paramd.av[1]).indexOf(typed.scalar(paramd.av[0])) === -1;
    },
    "&": function (paramd) {
        if (paramd.av.length !== 2) {
            return false;
        }


        var as = _list(paramd.av[0]);
        var bs = _list(paramd.av[1]);
        var cs = [];

        as.map(function (v) {
            if ((cs.indexOf(v) === -1) && (bs.indexOf(v) !== -1)) {
                cs.push(v);
            }
        });

        return cs;
    },
    "|": function (paramd) {
        if (paramd.av.length !== 2) {
            return false;
        }

        var as = _list(paramd.av[0]);
        var bs = _list(paramd.av[1]);

        var cs = [];
        var handle = function (v) {
            if (cs.indexOf(v) === -1) {
                cs.push(v);
            }
        };

        as.map(handle);
        bs.map(handle);

        return cs;
    },
    "!": function (paramd) {
        return !_true(paramd.first);
    },
    "and": function (paramd) {
        if (paramd.av.length !== 2) {
            return false;
        }

        if (!_true(paramd.av[0])) {
            return false;
        }
        if (!_true(paramd.av[1])) {
            return false;
        }

        return true;
    },
    "or": function (paramd) {
        if (paramd.av.length !== 2) {
            return false;
        }

        if (_true(paramd.av[0])) {
            return true;
        }
        if (_true(paramd.av[1])) {
            return true;
        }

        return false;
    },
    "count": function (paramd) {
        if (_true(paramd.first)) {
            return 1;
        } else {
            return null;
        }
    },
    "avg": function (paramd) {
        return paramd.first;
    },
    "sum": function (paramd) {
        return paramd.first;
    },
    "max": function (paramd) {
        return paramd.first;
    },
    "min": function (paramd) {
        return paramd.first;
    },
    "list": function (paramd) {
        // at some point we may need to re-introducte units
        return _list(paramd.first);
    },
    "has": function (paramd) {
        // this only gets called if the attribute exists, 
        return true;
    },
};

/**
 *  API
 */
exports.is_true = _true;
