var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
var _PeerProtocol_instances, _PeerProtocol_commandChunks, _PeerProtocol_dataChannelSender, _PeerProtocol_uploadingRequestId, _PeerProtocol_onChunkDownloaded, _PeerProtocol_onChunkUploaded, _PeerProtocol_channel, _PeerProtocol_peerConfig, _PeerProtocol_eventHandlers, _PeerProtocol_peerId, _PeerProtocol_onMessageReceived, _PeerProtocol_receivingCommandBytes;
import debug from "debug";
import * as Command from "./commands/index.js";
import { DataChannelSender } from "../webtorrent/data-channel-sender.js";
const logger = debug("p2pml-core:peer-protocol");
export class PeerProtocol {
    constructor(channel, peerConfig, eventHandlers, eventTarget, peerId) {
        _PeerProtocol_instances.add(this);
        _PeerProtocol_commandChunks.set(this, void 0);
        _PeerProtocol_dataChannelSender.set(this, void 0);
        _PeerProtocol_uploadingRequestId.set(this, void 0);
        _PeerProtocol_onChunkDownloaded.set(this, void 0);
        _PeerProtocol_onChunkUploaded.set(this, void 0);
        _PeerProtocol_channel.set(this, void 0);
        _PeerProtocol_peerConfig.set(this, void 0);
        _PeerProtocol_eventHandlers.set(this, void 0);
        _PeerProtocol_peerId.set(this, void 0);
        _PeerProtocol_onMessageReceived.set(this, (event) => {
            try {
                // WebRTC data channel assumed to have binaryType = "arraybuffer"
                const data = new Uint8Array(event.data);
                if (Command.isCommandChunk(data)) {
                    __classPrivateFieldGet(this, _PeerProtocol_instances, "m", _PeerProtocol_receivingCommandBytes).call(this, data);
                }
                else {
                    __classPrivateFieldGet(this, _PeerProtocol_eventHandlers, "f").onSegmentChunkReceived(data);
                    __classPrivateFieldGet(this, _PeerProtocol_onChunkDownloaded, "f").call(this, data.byteLength, "p2p", __classPrivateFieldGet(this, _PeerProtocol_peerId, "f"), __classPrivateFieldGet(this, _PeerProtocol_peerConfig, "f").streamType, __classPrivateFieldGet(this, _PeerProtocol_peerConfig, "f").infoHash);
                }
            }
            catch (err) {
                logger("error handling data channel message: %O", err);
                __classPrivateFieldGet(this, _PeerProtocol_eventHandlers, "f").onProtocolError(err);
            }
        });
        __classPrivateFieldSet(this, _PeerProtocol_channel, channel, "f");
        __classPrivateFieldSet(this, _PeerProtocol_peerConfig, peerConfig, "f");
        __classPrivateFieldSet(this, _PeerProtocol_eventHandlers, eventHandlers, "f");
        __classPrivateFieldSet(this, _PeerProtocol_peerId, peerId, "f");
        __classPrivateFieldSet(this, _PeerProtocol_dataChannelSender, new DataChannelSender(channel, peerConfig.webRtcMaxMessageSize), "f");
        __classPrivateFieldSet(this, _PeerProtocol_onChunkDownloaded, eventTarget.getEventDispatcher("onChunkDownloaded"), "f");
        __classPrivateFieldSet(this, _PeerProtocol_onChunkUploaded, eventTarget.getEventDispatcher("onChunkUploaded"), "f");
        if (channel.binaryType !== "arraybuffer") {
            throw new Error(`Expected binaryType "arraybuffer", got "${channel.binaryType}"`);
        }
        channel.addEventListener("message", __classPrivateFieldGet(this, _PeerProtocol_onMessageReceived, "f"));
    }
    sendCommand(command) {
        if (__classPrivateFieldGet(this, _PeerProtocol_channel, "f").readyState !== "open") {
            throw new Error(`cannot send command ${command.c} (channel state: ${__classPrivateFieldGet(this, _PeerProtocol_channel, "f").readyState})`);
        }
        const binaryCommandBuffers = Command.serializePeerCommand(command, __classPrivateFieldGet(this, _PeerProtocol_peerConfig, "f").webRtcMaxMessageSize);
        for (const buffer of binaryCommandBuffers) {
            __classPrivateFieldGet(this, _PeerProtocol_channel, "f").send(buffer);
        }
    }
    stopUploadingSegmentData() {
        __classPrivateFieldGet(this, _PeerProtocol_dataChannelSender, "f").cancel();
        __classPrivateFieldSet(this, _PeerProtocol_uploadingRequestId, undefined, "f");
    }
    getUploadingRequestId() {
        return __classPrivateFieldGet(this, _PeerProtocol_uploadingRequestId, "f");
    }
    splitSegmentDataToChunksAndUploadAsync(
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-arguments
    data, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (__classPrivateFieldGet(this, _PeerProtocol_uploadingRequestId, "f") !== undefined) {
                throw new Error(`Some segment data is already uploading.`);
            }
            __classPrivateFieldSet(this, _PeerProtocol_uploadingRequestId, requestId, "f");
            try {
                yield __classPrivateFieldGet(this, _PeerProtocol_dataChannelSender, "f").sendData(data, (chunkSize) => {
                    __classPrivateFieldGet(this, _PeerProtocol_onChunkUploaded, "f").call(this, chunkSize, __classPrivateFieldGet(this, _PeerProtocol_peerId, "f"), __classPrivateFieldGet(this, _PeerProtocol_peerConfig, "f").streamType, __classPrivateFieldGet(this, _PeerProtocol_peerConfig, "f").infoHash);
                });
            }
            finally {
                if (__classPrivateFieldGet(this, _PeerProtocol_uploadingRequestId, "f") === requestId) {
                    __classPrivateFieldSet(this, _PeerProtocol_uploadingRequestId, undefined, "f");
                }
            }
        });
    }
    destroy() {
        __classPrivateFieldGet(this, _PeerProtocol_channel, "f").removeEventListener("message", __classPrivateFieldGet(this, _PeerProtocol_onMessageReceived, "f"));
        __classPrivateFieldGet(this, _PeerProtocol_dataChannelSender, "f").cancel();
        __classPrivateFieldSet(this, _PeerProtocol_commandChunks, undefined, "f");
        __classPrivateFieldSet(this, _PeerProtocol_uploadingRequestId, undefined, "f");
    }
}
_PeerProtocol_commandChunks = new WeakMap(), _PeerProtocol_dataChannelSender = new WeakMap(), _PeerProtocol_uploadingRequestId = new WeakMap(), _PeerProtocol_onChunkDownloaded = new WeakMap(), _PeerProtocol_onChunkUploaded = new WeakMap(), _PeerProtocol_channel = new WeakMap(), _PeerProtocol_peerConfig = new WeakMap(), _PeerProtocol_eventHandlers = new WeakMap(), _PeerProtocol_peerId = new WeakMap(), _PeerProtocol_onMessageReceived = new WeakMap(), _PeerProtocol_instances = new WeakSet(), _PeerProtocol_receivingCommandBytes = function _PeerProtocol_receivingCommandBytes(buffer) {
    var _a;
    __classPrivateFieldSet(this, _PeerProtocol_commandChunks, (_a = __classPrivateFieldGet(this, _PeerProtocol_commandChunks, "f")) !== null && _a !== void 0 ? _a : new Command.BinaryCommandChunksJoiner((commandBuffer) => {
        __classPrivateFieldSet(this, _PeerProtocol_commandChunks, undefined, "f");
        // Peers are expected to be the same version; a deserialization
        // failure indicates a protocol-violating or buggy peer.
        let command;
        try {
            command = Command.deserializeCommand(commandBuffer);
        }
        catch (err) {
            logger("error deserializing command: %O", err);
            // This synchronously triggers Peer.destroy() -> channel.close()
            // from inside the onmessage handler, preventing further chunks from being processed.
            __classPrivateFieldGet(this, _PeerProtocol_eventHandlers, "f").onProtocolError(err);
            return;
        }
        __classPrivateFieldGet(this, _PeerProtocol_eventHandlers, "f").onCommandReceived(command);
    }), "f");
    try {
        __classPrivateFieldGet(this, _PeerProtocol_commandChunks, "f").addCommandChunk(buffer);
    }
    catch (err) {
        // Malformed chunk framing — same rationale as above.
        logger("error receiving command chunks: %O", err);
        __classPrivateFieldSet(this, _PeerProtocol_commandChunks, undefined, "f");
        // Triggers synchronous teardown inside the onmessage loop
        __classPrivateFieldGet(this, _PeerProtocol_eventHandlers, "f").onProtocolError(err);
    }
};
//# sourceMappingURL=peer-protocol.js.map