"use strict";

var fs = require('fs')
var path = require('path')
var minimist = require('minimist');
var parser = require("./grammar").parser;

var write = false;

var ad = require('minimist')(process.argv.slice(2), {
    boolean: [ "write" ],
});



var names = fs.readdirSync("./samples")
names.map(function(name) {
    if (!name.match(/[.]iotql$/)) {
        return;
    }

    var in_path = path.join("samples", name);
    var out_path = path.join("samples", name.replace(/[.]iotql/, ".json"));
    var contents = fs.readFileSync(in_path, 'utf-8');

    try {
        var result = parser.parse(contents);
        console.log(name, "ok");

        if (ad.write) {
            fs.writeFileSync(out_path, JSON.stringify(result, null, 2));
        }
    }
    catch (x) {
        console.log(name, "failed:", ( "" + x ).replace(/\n.*$/gm, ''));
    }
});
