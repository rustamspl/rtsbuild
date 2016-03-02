"use strict";
///<reference path="../typings/node/node.d.ts" />
var fs = require('fs');
var path = require('./rpath');
var ts_promise_1 = require('ts-promise');
function dumpError(err) {
    if (typeof err === 'object') {
        if (err.message) {
            console.log('\nMessage: ' + err.message);
        }
        if (err.stack) {
            console.log('\nStacktrace:');
            console.log('====================');
            console.log(err.stack);
        }
    }
    else {
        console.log('dumpError :: argument is not an object:', err);
    }
}
;
;
var Pipe = (function () {
    function Pipe() {
        this.queue = [];
        this.files = {};
        this.usedFiles = {};
        this.watchers = {};
        this.queueInProcess = false;
        this.needProcessQueue = false;
        this.processQueueOnNextTick();
    }
    Pipe.prototype.processQueueOnNextTick = function () {
        var _this = this;
        process.nextTick(function () {
            _this.processQueue();
        });
    };
    Pipe.prototype.removeUnusedFiles = function () {
        for (var fn in this.watchers) {
            if (!(fn in this.usedFiles)) {
                this.watchers[fn].close();
                delete this.watchers[fn];
                delete this.files[fn];
            }
        }
        this.usedFiles = {};
    };
    Pipe.prototype.loadFile = function (fn) {
        if (!path.fileExists(fn)) {
            var err = 'Watcher:File not exists:' + fn;
            console.log(err);
            throw err;
        }
        ;
        this.files[fn] = fs.readFileSync(fn).toString();
    };
    Pipe.prototype.getFile = function (fn) {
        var _this = this;
        if (!(fn in this.files)) {
            this.loadFile(fn);
        }
        if (!(fn in this.watchers)) {
            this.watchers[fn] = fs.watch(fn, function (evt, evtfn) {
                if (evt === 'change') {
                    _this.loadFile(fn);
                    _this.processQueueOnNextTick();
                }
            });
        }
        this.usedFiles[fn] = true;
        return this.files[fn];
    };
    Pipe.prototype.processQueueItem = function (i, data) {
        var _this = this;
        return new ts_promise_1.default(function (resolve, reject) {
            if (i >= _this.queue.length) {
                resolve(data);
            }
            var r = _this.queue[i](data);
            if (r instanceof ts_promise_1.default) {
                r.then(function (v) {
                    resolve(_this.processQueueItem(i + 1, v));
                });
            }
            else {
                resolve(_this.processQueueItem(i + 1, r));
            }
        });
    };
    Pipe.prototype.processQueue = function () {
        var _this = this;
        if (this.queueInProcess) {
            this.needProcessQueue = true;
            return;
        }
        this.queueInProcess = true;
        this.needProcessQueue = false;
        this.removeUnusedFiles();
        this.processQueueItem(0, {
            files: {},
            getFile: function (fn) { return _this.getFile(fn); }
        })
            .catch(function (v) {
            dumpError(v);
        })
            .finally(function () {
            _this.queueInProcess = false;
            if (_this.needProcessQueue) {
                _this.processQueueOnNextTick();
            }
        });
    };
    Pipe.prototype.pipe = function (cb) {
        this.queue.push(cb);
        return this;
    };
    return Pipe;
}());
exports.Pipe = Pipe;
function create() {
    return new Pipe();
}
exports.create = create;
