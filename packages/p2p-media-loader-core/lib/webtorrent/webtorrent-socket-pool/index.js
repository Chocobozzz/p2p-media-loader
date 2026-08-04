var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _WebTorrentSocketPool_sockets, _WebTorrentSocketPool_eventTarget;
import { WebSocketClient } from "../websocket-client/index.js";
import { EventTarget } from "../../utils/event-target.js";
export class WebTorrentSocketPool {
    constructor() {
        _WebTorrentSocketPool_sockets.set(this, new Map());
        _WebTorrentSocketPool_eventTarget.set(this, new EventTarget());
    }
    addEventListener(eventName, listener) {
        __classPrivateFieldGet(this, _WebTorrentSocketPool_eventTarget, "f").addEventListener(eventName, listener);
    }
    removeEventListener(eventName, listener) {
        __classPrivateFieldGet(this, _WebTorrentSocketPool_eventTarget, "f").removeEventListener(eventName, listener);
    }
    acquire(url) {
        let entry = __classPrivateFieldGet(this, _WebTorrentSocketPool_sockets, "f").get(url);
        if (!entry) {
            const client = new WebSocketClient({ url });
            client.addEventListener("error", (error) => {
                __classPrivateFieldGet(this, _WebTorrentSocketPool_eventTarget, "f").dispatchEvent("error", error, url);
            });
            client.connect();
            entry = { client, refCount: 0 };
            __classPrivateFieldGet(this, _WebTorrentSocketPool_sockets, "f").set(url, entry);
        }
        entry.refCount++;
        let isReleased = false;
        return {
            client: entry.client,
            release: () => {
                if (isReleased)
                    return;
                isReleased = true;
                entry.refCount--;
                if (entry.refCount <= 0) {
                    if (entry.refCount < 0) {
                        // eslint-disable-next-line no-console
                        console.error(`[WebTorrentSocketPool] Negative refCount detected for ${url}`);
                    }
                    const currentEntry = __classPrivateFieldGet(this, _WebTorrentSocketPool_sockets, "f").get(url);
                    if (currentEntry === entry) {
                        __classPrivateFieldGet(this, _WebTorrentSocketPool_sockets, "f").delete(url);
                    }
                    entry.client.dispose();
                }
            },
        };
    }
    destroy() {
        __classPrivateFieldGet(this, _WebTorrentSocketPool_eventTarget, "f").clear();
        const entries = Array.from(__classPrivateFieldGet(this, _WebTorrentSocketPool_sockets, "f").values());
        __classPrivateFieldGet(this, _WebTorrentSocketPool_sockets, "f").clear();
        for (const entry of entries) {
            try {
                entry.client.dispose();
            }
            catch (error) {
                // eslint-disable-next-line no-console
                console.error("[WebTorrentSocketPool] Failed to dispose WebSocketClient:", error);
            }
        }
    }
}
_WebTorrentSocketPool_sockets = new WeakMap(), _WebTorrentSocketPool_eventTarget = new WeakMap();
//# sourceMappingURL=index.js.map