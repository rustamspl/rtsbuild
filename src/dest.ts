import path = require('./rpath');
import watch = require('./watch');
import  fs = require('fs');
export = function(dst:string):watch.ICallback {
    return function(d:watch.IData) {
        for (var fn in d.files) {
            var fpath = path.join(dst, fn);
            var dirpath = path.dirname(fpath);            
            path.mkdirSyncRecursive(dirpath);
            fs.writeFile(fpath, d.files[fn]);
        }
        return d;
    };
}