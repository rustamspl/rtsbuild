///<reference path="../typings/node/node.d.ts" />

import ts = require('typescript');

import Promise from 'ts-promise';
import * as watch from './watch';

import path = require('./rpath');



function compile(opts: ICompilatorOptions, d: watch.IData) {
    const options: ts.CompilerOptions = { module: ts.ModuleKind.AMD, target: ts.ScriptTarget.ES5 };
    options.outFile = opts.outFile; //'dist/js/app.js';
    
   
    
    
    var p = new Promise<watch.IData>((resolve, reject) => {

        function fileExists(fileName: string): boolean {
            console.log('fileExists',fileName);
            return true;//ts.sys.fileExists(fileName);
        }
        
        function readFile(fileName: string): string {
            console.log('readFile',fileName);
            return d.getFile(path.relative('.', fileName));
        }

        function getSourceFile(fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void) {
            //const sourceText = ts.sys.readFile(fileName);
            console.log('ts.sys.readFile',fileName);
            const sourceText = d.getFile(path.relative('.', fileName));
            return sourceText !== undefined ? ts.createSourceFile(fileName, sourceText, languageVersion) : undefined;
        }

        function resolveModuleNames(moduleNames: string[], containingFile: string): ts.ResolvedModule[] {
            return moduleNames.map(moduleName => {
                // try to use standard resolution
                let result = ts.resolveModuleName(moduleName, containingFile, options, { fileExists, readFile });

                if (result.resolvedModule) {
                    console.log(moduleName, result.resolvedModule);
                    return result.resolvedModule;
                }

                return undefined;
            });
        }
        function writeFile(fileName, content) {
            var files:watch.IFiles={};
            console.log('writeFile',fileName);
            var fn=path.relative('.', fileName)
            files[fn]=content;
            resolve({
               files:files,
               getFile:d.getFile 
            });
        }
        const host = {
            getSourceFile,
            getDefaultLibFileName: () => "lib.d.ts",
            writeFile,//: (fileName, content) => ts.sys.writeFile(fileName, content)
            getCurrentDirectory: () => ts.sys.getCurrentDirectory(),
            getCanonicalFileName: fileName => ts.sys.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase(),
            getNewLine: () => ts.sys.newLine,
            useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
            fileExists,
            readFile,

            resolveModuleNames
        }

        const program = ts.createProgram([opts.entry], options, host);
        program.emit();

    });
    return p;
}

//---------------------------------
interface ICompilatorOptions {
    outFile: string;
    entry: string;
}
export = function(opts: ICompilatorOptions) {
    
    return watch.create().pipe(function(d) {
        return compile(opts, d);
    });
};