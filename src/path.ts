///<reference path="../typings/node/node.d.ts" />
import path = require('path');
import fs = require('fs');


module path{    
     function dirExists(dirpath:string){
        try {
            return fs.statSync(dirpath).isDirectory();
        } catch (err) {
            return false;
        }
     } 
     function fileExists(filepath) {
        try {
            return fs.statSync(filepath).isFile();
        } catch (err) {
            return false;
        }
    }
    function mkdirSyncRecursive(dirpath){
        if (!this.dirExists(dirpath)) {
            this.mkdirSyncRecursive(this.dirname(dirpath));
            fs.mkdirSync(dirpath);
        }
    };
}



// 'resolve,normalize,relative,join'.split(',').map(function(k) {
//     path[k] = function() {
//         return org_path[k].apply(this, arguments).replace(/\\/g, '/').toLowerCase();
//     };
//     path.dirExists = function(dirpath) {
//         try {
//             return fs.statSync(dirpath).isDirectory();
//         } catch (err) {
//             return false;
//         }
//     };
//     path.fileExists = function(filepath) {
//         try {
//             return fs.statSync(filepath).isFile();
//         } catch (err) {
//             return false;
//         }
//     };
//     path.mkdirSyncRecursive = function(dirpath) {
//         if (!path.dirExists(dirpath)) {
//             path.mkdirSyncRecursive(path.dirname(dirpath));
//             fs.mkdirSync(dirpath);
//         }
//     };
// });
// export = path;