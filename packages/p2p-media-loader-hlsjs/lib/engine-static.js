var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { HlsJsP2PEngine, } from "./engine.js";
export function injectMixin(HlsJsClass) {
    var _HlsJsWithP2PClass_p2pEngine, _a;
    return _a = class HlsJsWithP2PClass extends HlsJsClass {
            get p2pEngine() {
                return __classPrivateFieldGet(this, _HlsJsWithP2PClass_p2pEngine, "f");
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            constructor(...args) {
                var _b;
                const config = args[0];
                const _c = config !== null && config !== void 0 ? config : {}, { p2p } = _c, hlsJsConfig = __rest(_c, ["p2p"]);
                const p2pEngine = new HlsJsP2PEngine(p2p);
                super(Object.assign(Object.assign({}, hlsJsConfig), p2pEngine.getConfigForHlsJs()));
                _HlsJsWithP2PClass_p2pEngine.set(this, void 0);
                p2pEngine.bindHls(this);
                __classPrivateFieldSet(this, _HlsJsWithP2PClass_p2pEngine, p2pEngine, "f");
                (_b = p2p === null || p2p === void 0 ? void 0 : p2p.onHlsJsCreated) === null || _b === void 0 ? void 0 : _b.call(p2p, this);
            }
        },
        _HlsJsWithP2PClass_p2pEngine = new WeakMap(),
        _a;
}
//# sourceMappingURL=engine-static.js.map