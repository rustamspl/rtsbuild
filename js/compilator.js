///<reference path="../typings/node/node.d.ts" />
"use strict";
var ts = require('typescript');
var ts_promise_1 = require('ts-promise');
var watch = require('./watch');
var path = require('./rpath');
//import fs = require('fs');
//var def=fs.readFileSync(path.dirname(__dirname)+'/data/define.js').toString();
function compile(opts, d) {
    var options = { module: ts.ModuleKind.AMD, target: ts.ScriptTarget.ES5 };
    options.outFile = opts.outFile; //'dist/js/app.js';
    var p = new ts_promise_1.default(function (resolve, reject) {
        function fileExists(fileName) {
            //console.log('fileExists',fileName);
            return true; //ts.sys.fileExists(fileName);
        }
        function readFile(fileName) {
            //console.log('readFile',fileName);
            return d.getFile(path.relative('.', fileName));
        }
        function getSourceFile(fileName, languageVersion, onError) {
            //const sourceText = ts.sys.readFile(fileName);
            //console.log('ts.sys.readFile',fileName);
            var sourceText = d.getFile(path.relative('.', fileName));
            // console.log('ts.sys.readFile.sourceText',sourceText);
            return sourceText !== undefined ? ts.createSourceFile(fileName, sourceText, languageVersion) : undefined;
        }
        function resolveModuleNames(moduleNames, containingFile) {
            return moduleNames.map(function (moduleName) {
                // try to use standard resolution
                var result = ts.resolveModuleName(moduleName, containingFile, options, { fileExists: fileExists, readFile: readFile });
                if (result.resolvedModule) {
                    //console.log(moduleName, result.resolvedModule);
                    return result.resolvedModule;
                }
                return undefined;
            });
        }
        function writeFile(fileName, content) {
            var files = {};
            var deffn = path.relative('.', path.dirname(__dirname) + '/data/define.js');
            // console.log('writeFile',fileName);
            var fn = path.relative('.', fileName);
            files[fn] = d.getFile(deffn) + content + ";__get_module__(__entry__);";
            resolve({
                files: files,
                getFile: d.getFile
            });
        }
        var host = {
            getSourceFile: getSourceFile,
            getDefaultLibFileName: function () { return ts.getDefaultLibFilePath(options); },
            writeFile: writeFile,
            getCurrentDirectory: function () { return ts.sys.getCurrentDirectory(); },
            getCanonicalFileName: function (fileName) { return ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase(); },
            getNewLine: function () { return ts.sys.newLine; },
            useCaseSensitiveFileNames: function () { return ts.sys.useCaseSensitiveFileNames; },
            fileExists: fileExists,
            readFile: readFile,
            resolveModuleNames: resolveModuleNames
        };
        var program = ts.createProgram([opts.entry], options, host);
        program.emit();
    });
    return p;
}
module.exports = function (opts) {
    return watch.create().pipe(function (d) {
        return compile(opts, d);
    });
};
