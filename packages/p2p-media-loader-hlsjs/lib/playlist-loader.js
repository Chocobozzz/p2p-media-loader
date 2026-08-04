var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _PlaylistLoaderBase_defaultLoader;
export class PlaylistLoaderBase {
    constructor(config) {
        _PlaylistLoaderBase_defaultLoader.set(this, void 0);
        Object.defineProperty(this, "context", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "stats", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        __classPrivateFieldSet(this, _PlaylistLoaderBase_defaultLoader, new config.loader(config), "f");
        this.stats = __classPrivateFieldGet(this, _PlaylistLoaderBase_defaultLoader, "f").stats;
        this.context = __classPrivateFieldGet(this, _PlaylistLoaderBase_defaultLoader, "f").context;
    }
    load(context, config, callbacks) {
        __classPrivateFieldGet(this, _PlaylistLoaderBase_defaultLoader, "f").load(context, config, callbacks);
    }
    abort() {
        __classPrivateFieldGet(this, _PlaylistLoaderBase_defaultLoader, "f").abort();
    }
    destroy() {
        __classPrivateFieldGet(this, _PlaylistLoaderBase_defaultLoader, "f").destroy();
    }
}
_PlaylistLoaderBase_defaultLoader = new WeakMap();
//# sourceMappingURL=playlist-loader.js.map