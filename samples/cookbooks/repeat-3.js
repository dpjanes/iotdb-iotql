/*
 *  repeat-3.js
 *
 *  David Janes
 *  IOTDB.org
 *  2014-12-30
 *
 *  This will broadcast Count=0, Count=1, Count=3
 *  when pushed.
 */

var iotdb = require('iotdb');

iotdb.cookbook("Demo");
iotdb.recipe({
    enabled: true,
    name: "Repeat 3",
    onclick: function(context) {
        context.message("");

        var count = 0;
        var id = setInterval(function() {
            console.log("recipe:repeat-3: Count=", count);
            context.message("Count=" + count);
            if (count++ >= 3) {
                clearInterval(id);
                context.done();
            }
        }, 3000);
    }
});
