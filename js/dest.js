"use strict";
var path = require('./rpath');
var fs = require('fs');
module.exports = function (dst) {
    return function (d) {
        for (var fn in d.files) {
            var fpath = path.join(dst, fn);
            var dirpath = path.dirname(fpath);
            path.mkdirSyncRecursive(dirpath);
            fs.writeFile(fpath, d.files[fn]);
        }
        return d;
    };
};
