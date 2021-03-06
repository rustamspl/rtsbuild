var __mods__ = {};
var __entry__;
function define(mod, deps, func) {
    __mods__[mod] = {
        deps: deps,
        func: func,
        instance: null
    };
    __entry__=mod;
}
function __require__(n) {
    throw 'not implemented';
}
function __get_module__(name) {
    var m = __mods__[name];
    if (!m.instance) {
        var exports = {};
        var module = { exports: exports };
        m.instance = m.func.apply(this,m.deps.map(function (n) {
            switch (n) {
                case 'require': return __require__;
                case 'module': return module;
                case 'exports': return exports;
                default: return __get_module__(n);
            }

        }));
    }
    return m.instance;
}
