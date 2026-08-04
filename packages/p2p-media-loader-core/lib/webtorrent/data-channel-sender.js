var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
var _DataChannelSender_currentSendContext;
import { getPromiseWithResolvers } from "../utils/utils.js";
import { getRTCErrorMessage } from "./utils.js";
const MAX_BUFFERED_AMOUNT = 64 * 1024; // 64 KB, matching simple-peer
export class DataChannelSender {
    constructor(channel, maxMessageSize) {
        Object.defineProperty(this, "channel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: channel
        });
        Object.defineProperty(this, "maxMessageSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: maxMessageSize
        });
        _DataChannelSender_currentSendContext.set(this, void 0);
    }
    sendData(
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-arguments
    data, onChunkSent) {
        return __awaiter(this, void 0, void 0, function* () {
            if (__classPrivateFieldGet(this, _DataChannelSender_currentSendContext, "f")) {
                throw new Error("Already sending data");
            }
            if (this.channel.readyState !== "open") {
                throw new Error("Data channel is not open");
            }
            this.channel.bufferedAmountLowThreshold = MAX_BUFFERED_AMOUNT;
            const { promise, resolve, reject } = getPromiseWithResolvers();
            let offset = 0;
            let isSettled = false;
            const cleanup = () => {
                if (isSettled)
                    return false;
                isSettled = true;
                __classPrivateFieldSet(this, _DataChannelSender_currentSendContext, undefined, "f");
                this.channel.removeEventListener("bufferedamountlow", sendChunks);
                this.channel.removeEventListener("closing", onClose);
                this.channel.removeEventListener("close", onClose);
                this.channel.removeEventListener("error", onError);
                return true;
            };
            __classPrivateFieldSet(this, _DataChannelSender_currentSendContext, {
                cancel: () => {
                    if (cleanup())
                        reject(new Error("Send cancelled"));
                },
            }, "f");
            const onClose = () => {
                if (cleanup())
                    reject(new Error("Data channel closed"));
            };
            const onError = (event) => {
                if (!cleanup())
                    return;
                const message = getRTCErrorMessage(event, "Unknown error");
                reject(new Error(`Data channel error: ${message}`));
            };
            const buffer = ArrayBuffer.isView(data) ? data.buffer : data;
            const byteOffset = ArrayBuffer.isView(data) ? data.byteOffset : 0;
            const sendChunks = () => {
                if (isSettled)
                    return;
                if (this.channel.readyState !== "open") {
                    if (cleanup()) {
                        reject(new Error(`Data channel not open (state: ${this.channel.readyState})`));
                    }
                    return;
                }
                try {
                    while (offset < data.byteLength) {
                        if (this.channel.bufferedAmount > MAX_BUFFERED_AMOUNT) {
                            return;
                        }
                        const bytesToSend = Math.min(this.maxMessageSize, data.byteLength - offset);
                        const chunk = new Uint8Array(buffer, byteOffset + offset, bytesToSend);
                        this.channel.send(chunk);
                        offset += bytesToSend;
                        onChunkSent === null || onChunkSent === void 0 ? void 0 : onChunkSent(bytesToSend);
                        // The callback may have called cancel(), which settles the promise.
                        if (!__classPrivateFieldGet(this, _DataChannelSender_currentSendContext, "f"))
                            return;
                    }
                }
                catch (error) {
                    if (cleanup()) {
                        reject(error instanceof Error ? error : new Error(String(error)));
                    }
                    return;
                }
                if (cleanup())
                    resolve();
            };
            this.channel.addEventListener("bufferedamountlow", sendChunks);
            this.channel.addEventListener("closing", onClose);
            this.channel.addEventListener("close", onClose);
            this.channel.addEventListener("error", onError);
            // Start sending
            sendChunks();
            return promise;
        });
    }
    cancel() {
        var _a;
        (_a = __classPrivateFieldGet(this, _DataChannelSender_currentSendContext, "f")) === null || _a === void 0 ? void 0 : _a.cancel();
    }
}
_DataChannelSender_currentSendContext = new WeakMap();
//# sourceMappingURL=data-channel-sender.js.map