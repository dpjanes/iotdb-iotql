var fs = require('fs');
var path = require('path');

var source = path.resolve("./node_modules");
var destination = path.resolve("./commands/node_modules");

fs.stat(destination, function(error, stbuf) {
    // we are looking for the error!
    if (!error) {
        console.log("+", "exists ok", destination);
        return;
    }

    fs.symlink(source, destination, function(error) {
        if (error) {
            console.log("#", error);
        } else {
            console.log("+", "made symlink", destination);
        }
    });
});

