///<reference path="../typings/node/node.d.ts" />
import fs = require('fs');
import path = require("./rpath");
import Promise from "ts-promise";


function dumpError(err: any) {
    if (typeof err === 'object') {
        if (err.message) {
            console.log('\nMessage: ' + err.message)
        }
        if (err.stack) {
            console.log('\nStacktrace:')
            console.log('====================')
            console.log(err.stack);
        }
    } else {
        console.log('dumpError :: argument is not an object:', err);
    }
}
interface IFiles { [filename: string]: string };

interface IData {
    files: IFiles;
    getFile: { (fn: string): string };
};

interface ICallback {
    (data: IData): Thenable<IData>
}

class Pipe {
    private queue: ICallback[] = [];
    private files: IFiles = {};
    private usedFiles: { [filename: string]: boolean } = {};
    private watchers: { [filename: string]: fs.FSWatcher } = {};
    private timeout: NodeJS.Timer;
    private queueInProcess = false;
    private needProcessQueue = false;
    constructor() {
        this.processQueueOnNextTick();
    }
    private processQueueOnNextTick() {
        process.nextTick(() => {
            this.processQueue();
        })
    }
    private removeUnusedFiles() {
        for (var fn in this.watchers) {
            if (!(fn in this.usedFiles)) {
                this.watchers[fn].close();
                delete this.watchers[fn];
                delete this.files[fn];
            }
        }
        this.usedFiles = {}
    }

    private loadFile(fn) {
        if (!path.fileExists(fn)) {
            var err = 'File not exists:' + fn;
            console.log(err);
            throw err;
        };
        this.files[fn] = fs.readFileSync(fn).toString();
    }

    private getFile(fn: string) {
        if (!(fn in this.files)) {
            this.loadFile(fn);
        }
        if (!(fn in this.watchers)) {
            this.watchers[fn] = fs.watch(fn, (evt, evtfn) => {
                if (evt === 'change') {
                    this.loadFile(fn);
                    this.processQueueOnNextTick();
                }
            });
        }
        this.usedFiles[fn] = true;
        return this.files[fn];
    }
    private processQueueItem(i: number, data: IData): Promise<IData> {
        return new Promise<IData>((resolve, reject) => {
            if (i >= this.queue.length) {
                resolve(data);
            }
            this.queue[i](data).then((v) => {
                resolve(this.processQueueItem(i + 1, v));
            });
        });
    }
    private processQueue() {
        if (this.queueInProcess) {
            this.needProcessQueue = true;
            return;
        }
        this.queueInProcess = true;
        this.needProcessQueue = false;
        this.removeUnusedFiles();
        this.processQueueItem(0, {
            files: {},
            getFile: (fn) => this.getFile(fn)
        })
            .catch((v) => {
                dumpError(v);
            })
            .finally(() => {
                this.queueInProcess = false;
                if (this.needProcessQueue) {
                    this.processQueueOnNextTick();
                }

            });
    }
    pipe(cb: ICallback): Pipe {
        this.queue.push(cb);
        return this;
    }

}
function watch(): Pipe {
    return new Pipe();
}


export =watch;