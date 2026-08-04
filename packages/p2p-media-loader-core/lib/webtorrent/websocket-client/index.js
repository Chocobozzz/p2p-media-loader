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
var _WebSocketClient_instances, _WebSocketClient_config, _WebSocketClient_state, _WebSocketClient_ws, _WebSocketClient_backoffCount, _WebSocketClient_reconnectTimeoutId, _WebSocketClient_eventTarget, _WebSocketClient_onOpen, _WebSocketClient_onClose, _WebSocketClient_onError, _WebSocketClient_onMessage, _WebSocketClient_scheduleReconnect, _WebSocketClient_clearReconnectTimeout;
import { EventTarget } from "../../utils/event-target.js";
export class WebSocketClient {
    constructor(config) {
        var _a, _b, _c;
        _WebSocketClient_instances.add(this);
        _WebSocketClient_config.set(this, void 0);
        _WebSocketClient_state.set(this, "disconnected");
        _WebSocketClient_ws.set(this, null);
        _WebSocketClient_backoffCount.set(this, 0);
        _WebSocketClient_reconnectTimeoutId.set(this, null);
        _WebSocketClient_eventTarget.set(this, new EventTarget());
        _WebSocketClient_onOpen.set(this, () => {
            if (__classPrivateFieldGet(this, _WebSocketClient_state, "f") === "disposed")
                return;
            __classPrivateFieldSet(this, _WebSocketClient_state, "connected", "f");
            __classPrivateFieldSet(this, _WebSocketClient_backoffCount, 0, "f");
            __classPrivateFieldGet(this, _WebSocketClient_eventTarget, "f").dispatchEvent("connected");
        });
        _WebSocketClient_onClose.set(this, () => {
            if (__classPrivateFieldGet(this, _WebSocketClient_state, "f") === "disposed")
                return;
            if (__classPrivateFieldGet(this, _WebSocketClient_ws, "f")) {
                __classPrivateFieldGet(this, _WebSocketClient_ws, "f").onopen = null;
                __classPrivateFieldGet(this, _WebSocketClient_ws, "f").onclose = null;
                __classPrivateFieldGet(this, _WebSocketClient_ws, "f").onerror = null;
                __classPrivateFieldGet(this, _WebSocketClient_ws, "f").onmessage = null;
                __classPrivateFieldSet(this, _WebSocketClient_ws, null, "f");
            }
            __classPrivateFieldGet(this, _WebSocketClient_instances, "m", _WebSocketClient_scheduleReconnect).call(this);
            __classPrivateFieldGet(this, _WebSocketClient_eventTarget, "f").dispatchEvent("disconnected");
        });
        _WebSocketClient_onError.set(this, (event) => {
            if (__classPrivateFieldGet(this, _WebSocketClient_state, "f") === "disposed")
                return;
            __classPrivateFieldGet(this, _WebSocketClient_eventTarget, "f").dispatchEvent("error", event);
        });
        _WebSocketClient_onMessage.set(this, (event) => {
            if (__classPrivateFieldGet(this, _WebSocketClient_state, "f") === "disposed")
                return;
            __classPrivateFieldGet(this, _WebSocketClient_eventTarget, "f").dispatchEvent("message", event.data);
        });
        const initialDelay = Math.max(100, (_a = config.initialDelay) !== null && _a !== void 0 ? _a : 1000);
        __classPrivateFieldSet(this, _WebSocketClient_config, {
            url: config.url,
            initialDelay,
            // Ensure maxDelay is never less than initialDelay
            maxDelay: Math.max(initialDelay, (_b = config.maxDelay) !== null && _b !== void 0 ? _b : 30000),
            jitterMultiplier: Math.max(0, (_c = config.jitterMultiplier) !== null && _c !== void 0 ? _c : 0.2),
        }, "f");
    }
    get state() {
        return __classPrivateFieldGet(this, _WebSocketClient_state, "f");
    }
    addEventListener(eventName, listener) {
        __classPrivateFieldGet(this, _WebSocketClient_eventTarget, "f").addEventListener(eventName, listener);
    }
    removeEventListener(eventName, listener) {
        __classPrivateFieldGet(this, _WebSocketClient_eventTarget, "f").removeEventListener(eventName, listener);
    }
    connect() {
        if (__classPrivateFieldGet(this, _WebSocketClient_state, "f") === "connected" ||
            __classPrivateFieldGet(this, _WebSocketClient_state, "f") === "connecting" ||
            __classPrivateFieldGet(this, _WebSocketClient_state, "f") === "disposed") {
            return;
        }
        __classPrivateFieldSet(this, _WebSocketClient_state, "connecting", "f");
        __classPrivateFieldGet(this, _WebSocketClient_instances, "m", _WebSocketClient_clearReconnectTimeout).call(this);
        try {
            __classPrivateFieldSet(this, _WebSocketClient_ws, new WebSocket(__classPrivateFieldGet(this, _WebSocketClient_config, "f").url), "f");
            __classPrivateFieldGet(this, _WebSocketClient_ws, "f").binaryType = "arraybuffer";
            __classPrivateFieldGet(this, _WebSocketClient_ws, "f").onopen = __classPrivateFieldGet(this, _WebSocketClient_onOpen, "f");
            __classPrivateFieldGet(this, _WebSocketClient_ws, "f").onclose = __classPrivateFieldGet(this, _WebSocketClient_onClose, "f");
            __classPrivateFieldGet(this, _WebSocketClient_ws, "f").onerror = __classPrivateFieldGet(this, _WebSocketClient_onError, "f");
            __classPrivateFieldGet(this, _WebSocketClient_ws, "f").onmessage = __classPrivateFieldGet(this, _WebSocketClient_onMessage, "f");
        }
        catch (error) {
            __classPrivateFieldSet(this, _WebSocketClient_state, "disconnected", "f");
            const errorEvent = new ErrorEvent("error", {
                message: error instanceof Error
                    ? error.message
                    : "Unknown WebSocket creation error",
                error,
            });
            __classPrivateFieldGet(this, _WebSocketClient_eventTarget, "f").dispatchEvent("error", errorEvent);
        }
    }
    send(
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-arguments
    data) {
        if (__classPrivateFieldGet(this, _WebSocketClient_state, "f") !== "connected" || !__classPrivateFieldGet(this, _WebSocketClient_ws, "f")) {
            throw new Error("WebSocketClient: Cannot send data when not connected");
        }
        __classPrivateFieldGet(this, _WebSocketClient_ws, "f").send(data);
    }
    dispose() {
        __classPrivateFieldSet(this, _WebSocketClient_state, "disposed", "f");
        __classPrivateFieldGet(this, _WebSocketClient_instances, "m", _WebSocketClient_clearReconnectTimeout).call(this);
        if (__classPrivateFieldGet(this, _WebSocketClient_ws, "f")) {
            __classPrivateFieldGet(this, _WebSocketClient_ws, "f").onopen = null;
            __classPrivateFieldGet(this, _WebSocketClient_ws, "f").onclose = null;
            __classPrivateFieldGet(this, _WebSocketClient_ws, "f").onerror = null;
            __classPrivateFieldGet(this, _WebSocketClient_ws, "f").onmessage = null;
            __classPrivateFieldGet(this, _WebSocketClient_ws, "f").close();
            __classPrivateFieldSet(this, _WebSocketClient_ws, null, "f");
        }
        __classPrivateFieldGet(this, _WebSocketClient_eventTarget, "f").clear();
    }
}
_WebSocketClient_config = new WeakMap(), _WebSocketClient_state = new WeakMap(), _WebSocketClient_ws = new WeakMap(), _WebSocketClient_backoffCount = new WeakMap(), _WebSocketClient_reconnectTimeoutId = new WeakMap(), _WebSocketClient_eventTarget = new WeakMap(), _WebSocketClient_onOpen = new WeakMap(), _WebSocketClient_onClose = new WeakMap(), _WebSocketClient_onError = new WeakMap(), _WebSocketClient_onMessage = new WeakMap(), _WebSocketClient_instances = new WeakSet(), _WebSocketClient_scheduleReconnect = function _WebSocketClient_scheduleReconnect() {
    var _a;
    if (__classPrivateFieldGet(this, _WebSocketClient_state, "f") === "disposed")
        return;
    __classPrivateFieldSet(this, _WebSocketClient_state, "reconnecting", "f");
    const baseDelay = Math.min(__classPrivateFieldGet(this, _WebSocketClient_config, "f").initialDelay * Math.pow(2, __classPrivateFieldGet(this, _WebSocketClient_backoffCount, "f")), __classPrivateFieldGet(this, _WebSocketClient_config, "f").maxDelay);
    const jitter = baseDelay * __classPrivateFieldGet(this, _WebSocketClient_config, "f").jitterMultiplier;
    const randomJitter = Math.random() * 2 * jitter - jitter;
    const delay = Math.max(0, baseDelay + randomJitter);
    if (baseDelay < __classPrivateFieldGet(this, _WebSocketClient_config, "f").maxDelay) {
        __classPrivateFieldSet(this, _WebSocketClient_backoffCount, (_a = __classPrivateFieldGet(this, _WebSocketClient_backoffCount, "f"), _a++, _a), "f");
    }
    __classPrivateFieldSet(this, _WebSocketClient_reconnectTimeoutId, setTimeout(() => {
        if (__classPrivateFieldGet(this, _WebSocketClient_state, "f") !== "disposed") {
            this.connect();
        }
    }, delay), "f");
    __classPrivateFieldGet(this, _WebSocketClient_eventTarget, "f").dispatchEvent("reconnecting");
}, _WebSocketClient_clearReconnectTimeout = function _WebSocketClient_clearReconnectTimeout() {
    if (__classPrivateFieldGet(this, _WebSocketClient_reconnectTimeoutId, "f") !== null) {
        clearTimeout(__classPrivateFieldGet(this, _WebSocketClient_reconnectTimeoutId, "f"));
        __classPrivateFieldSet(this, _WebSocketClient_reconnectTimeoutId, null, "f");
    }
};
//# sourceMappingURL=index.js.map