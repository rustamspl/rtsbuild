///<reference path="../typings/node/node.d.ts" />
import  org_path = require('path');
import fs = require('fs');
var P = function() {};
P.prototype = org_path;

interface IPath{  
        /**
      * checks dirpath is exists
      * @param dirpath string path to check.
      */
     dirExists(dirpath: string): boolean;

    /**
      * checks filepath is exists
      * @param filepath string path to check.
      */
    fileExists(filepath: string): boolean;

    /**
       * creates path recursively
       * @param dirpath string path to create.
       */
    mkdirSyncRecursive(dirpath: string): void;
     normalize(p: string): string;
    /**
     * Join all arguments together and normalize the resulting path.
     * Arguments must be strings. In v0.8, non-string arguments were silently ignored. In v0.10 and up, an exception is thrown.
     *
     * @param paths string paths to join.
     */
     join(...paths: any[]): string;
    /**
     * Join all arguments together and normalize the resulting path.
     * Arguments must be strings. In v0.8, non-string arguments were silently ignored. In v0.10 and up, an exception is thrown.
     *
     * @param paths string paths to join.
     */
     join(...paths: string[]): string;
    /**
     * The right-most parameter is considered {to}.  Other parameters are considered an array of {from}.
     *
     * Starting from leftmost {from} paramter, resolves {to} to an absolute path.
     *
     * If {to} isn't already absolute, {from} arguments are prepended in right to left order, until an absolute path is found. If after using all {from} paths still no absolute path is found, the current working directory is used as well. The resulting path is normalized, and trailing slashes are removed unless the path gets resolved to the root directory.
     *
     * @param pathSegments string paths to join.  Non-string arguments are ignored.
     */
    resolve(...pathSegments: any[]): string;
    /**
     * Solve the relative path from {from} to {to}.
     * At times we have two absolute paths, and we need to derive the relative path from one to the other. This is actually the reverse transform of path.resolve.
     *
     * @param from
     * @param to
     */
    relative(from: string, to: string): string;
    /**
     * Return the directory name of a path. Similar to the Unix dirname command.
     *
     * @param p the path to evaluate.
     */
    dirname(p: string): string;
 
}

var path:IPath = new P();
'resolve,normalize,relative,join'.split(',').map(function(k) {
    path[k] = function() {
        return org_path[k].apply(this, arguments).replace(/\\/g, '/').toLowerCase();
    };
    path.dirExists = function(dirpath) {
        try {
            return fs.statSync(dirpath).isDirectory();
        } catch (err) {
            return false;
        }
    };
    path.fileExists = function(filepath) {
        try {
            return fs.statSync(filepath).isFile();
        } catch (err) {
            return false;
        }
    };
    path.mkdirSyncRecursive = function(dirpath) {
        if (!path.dirExists(dirpath)) {
            path.mkdirSyncRecursive(path.dirname(dirpath));
            fs.mkdirSync(dirpath);
        }
    };
});
export = path;