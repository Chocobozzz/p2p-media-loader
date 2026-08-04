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
var _BinaryCommandChunksJoiner_instances, _BinaryCommandChunksJoiner_chunks, _BinaryCommandChunksJoiner_status, _BinaryCommandChunksJoiner_onComplete, _BinaryCommandChunksJoiner_unframeCommandChunk, _BinaryCommandCreator_bytes, _BinaryCommandCreator_resultBuffers, _BinaryCommandCreator_status, _BinaryCommandCreator_maxChunkLength;
import * as Serialization from "./binary-serialization.js";
import { PeerCommandType, } from "./types.js";
const FRAME_PART_LENGTH = 4;
const commandFrameStart = stringToUtf8CodesBuffer("cstr", FRAME_PART_LENGTH);
const commandFrameEnd = stringToUtf8CodesBuffer("cend", FRAME_PART_LENGTH);
const commandDivFrameStart = stringToUtf8CodesBuffer("dstr", FRAME_PART_LENGTH);
const commandDivFrameEnd = stringToUtf8CodesBuffer("dend", FRAME_PART_LENGTH);
const startFrames = [commandFrameStart, commandDivFrameStart];
const endFrames = [commandFrameEnd, commandDivFrameEnd];
const commandFramesLength = commandFrameStart.length + commandFrameEnd.length;
export function isCommandChunk(buffer) {
    if (buffer.length < commandFramesLength)
        return false;
    const { length } = commandFrameStart;
    const bufferEndingToCompare = buffer.subarray(-length);
    return (startFrames.some((frame) => areBuffersEqual(buffer, frame, FRAME_PART_LENGTH)) &&
        endFrames.some((frame) => areBuffersEqual(bufferEndingToCompare, frame, FRAME_PART_LENGTH)));
}
function isFirstCommandChunk(buffer) {
    if (buffer.length < commandFramesLength)
        return false;
    return areBuffersEqual(buffer, commandFrameStart, FRAME_PART_LENGTH);
}
function isLastCommandChunk(buffer) {
    if (buffer.length < commandFramesLength)
        return false;
    return areBuffersEqual(buffer.subarray(-FRAME_PART_LENGTH), commandFrameEnd, FRAME_PART_LENGTH);
}
export class BinaryCommandJoiningError extends Error {
    constructor(type) {
        super();
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: type
        });
    }
}
export class BinaryCommandChunksJoiner {
    constructor(onComplete) {
        _BinaryCommandChunksJoiner_instances.add(this);
        _BinaryCommandChunksJoiner_chunks.set(this, new Serialization.ResizableUint8Array());
        _BinaryCommandChunksJoiner_status.set(this, "joining");
        _BinaryCommandChunksJoiner_onComplete.set(this, void 0);
        __classPrivateFieldSet(this, _BinaryCommandChunksJoiner_onComplete, onComplete, "f");
    }
    addCommandChunk(chunk) {
        if (__classPrivateFieldGet(this, _BinaryCommandChunksJoiner_status, "f") === "completed")
            return;
        const isFirstChunk = isFirstCommandChunk(chunk);
        if (!__classPrivateFieldGet(this, _BinaryCommandChunksJoiner_chunks, "f").length && !isFirstChunk) {
            throw new BinaryCommandJoiningError("no-first-chunk");
        }
        if (__classPrivateFieldGet(this, _BinaryCommandChunksJoiner_chunks, "f").length && isFirstChunk) {
            throw new BinaryCommandJoiningError("incomplete-joining");
        }
        __classPrivateFieldGet(this, _BinaryCommandChunksJoiner_chunks, "f").push(__classPrivateFieldGet(this, _BinaryCommandChunksJoiner_instances, "m", _BinaryCommandChunksJoiner_unframeCommandChunk).call(this, chunk));
        if (!isLastCommandChunk(chunk))
            return;
        __classPrivateFieldSet(this, _BinaryCommandChunksJoiner_status, "completed", "f");
        __classPrivateFieldGet(this, _BinaryCommandChunksJoiner_onComplete, "f").call(this, __classPrivateFieldGet(this, _BinaryCommandChunksJoiner_chunks, "f").getBuffer());
    }
}
_BinaryCommandChunksJoiner_chunks = new WeakMap(), _BinaryCommandChunksJoiner_status = new WeakMap(), _BinaryCommandChunksJoiner_onComplete = new WeakMap(), _BinaryCommandChunksJoiner_instances = new WeakSet(), _BinaryCommandChunksJoiner_unframeCommandChunk = function _BinaryCommandChunksJoiner_unframeCommandChunk(chunk) {
    if (chunk.length < commandFramesLength) {
        throw new Error("Command chunk is too short to unframe");
    }
    return chunk.subarray(FRAME_PART_LENGTH, chunk.length - FRAME_PART_LENGTH);
};
export class BinaryCommandCreator {
    constructor(commandType, maxChunkLength) {
        _BinaryCommandCreator_bytes.set(this, new Serialization.ResizableUint8Array());
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-arguments
        _BinaryCommandCreator_resultBuffers.set(this, []);
        _BinaryCommandCreator_status.set(this, "creating");
        _BinaryCommandCreator_maxChunkLength.set(this, void 0);
        __classPrivateFieldSet(this, _BinaryCommandCreator_maxChunkLength, maxChunkLength, "f");
        __classPrivateFieldGet(this, _BinaryCommandCreator_bytes, "f").push(commandType);
    }
    addInteger(name, value) {
        __classPrivateFieldGet(this, _BinaryCommandCreator_bytes, "f").push(name.charCodeAt(0));
        const bytes = Serialization.serializeInt(value);
        __classPrivateFieldGet(this, _BinaryCommandCreator_bytes, "f").push(bytes);
    }
    addUniqueSimilarIntArr(name, arr) {
        __classPrivateFieldGet(this, _BinaryCommandCreator_bytes, "f").push(name.charCodeAt(0));
        const bytes = Serialization.serializeUniqueSimilarIntArray(arr);
        __classPrivateFieldGet(this, _BinaryCommandCreator_bytes, "f").push(bytes);
    }
    addString(name, string) {
        __classPrivateFieldGet(this, _BinaryCommandCreator_bytes, "f").push(name.charCodeAt(0));
        const bytes = Serialization.serializeString(string);
        __classPrivateFieldGet(this, _BinaryCommandCreator_bytes, "f").push(bytes);
    }
    complete() {
        if (!__classPrivateFieldGet(this, _BinaryCommandCreator_bytes, "f").length)
            throw new Error("Buffer is empty");
        if (__classPrivateFieldGet(this, _BinaryCommandCreator_status, "f") === "completed")
            return;
        __classPrivateFieldSet(this, _BinaryCommandCreator_status, "completed", "f");
        const unframedBuffer = __classPrivateFieldGet(this, _BinaryCommandCreator_bytes, "f").getBuffer();
        if (unframedBuffer.length + commandFramesLength <= __classPrivateFieldGet(this, _BinaryCommandCreator_maxChunkLength, "f")) {
            __classPrivateFieldGet(this, _BinaryCommandCreator_resultBuffers, "f").push(frameBuffer(unframedBuffer, commandFrameStart, commandFrameEnd));
            return;
        }
        let chunksCount = Math.ceil(unframedBuffer.length / __classPrivateFieldGet(this, _BinaryCommandCreator_maxChunkLength, "f"));
        if (Math.ceil(unframedBuffer.length / chunksCount) + commandFramesLength >
            __classPrivateFieldGet(this, _BinaryCommandCreator_maxChunkLength, "f")) {
            chunksCount++;
        }
        for (const [i, chunk] of splitBufferToEqualChunks(unframedBuffer, chunksCount)) {
            if (i === 0) {
                __classPrivateFieldGet(this, _BinaryCommandCreator_resultBuffers, "f").push(frameBuffer(chunk, commandFrameStart, commandDivFrameEnd));
            }
            else if (i === chunksCount - 1) {
                __classPrivateFieldGet(this, _BinaryCommandCreator_resultBuffers, "f").push(frameBuffer(chunk, commandDivFrameStart, commandFrameEnd));
            }
            else {
                __classPrivateFieldGet(this, _BinaryCommandCreator_resultBuffers, "f").push(frameBuffer(chunk, commandDivFrameStart, commandDivFrameEnd));
            }
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-arguments
    getResultBuffers() {
        if (__classPrivateFieldGet(this, _BinaryCommandCreator_status, "f") === "creating" || !__classPrivateFieldGet(this, _BinaryCommandCreator_resultBuffers, "f").length) {
            throw new Error("Command is not complete.");
        }
        return __classPrivateFieldGet(this, _BinaryCommandCreator_resultBuffers, "f");
    }
}
_BinaryCommandCreator_bytes = new WeakMap(), _BinaryCommandCreator_resultBuffers = new WeakMap(), _BinaryCommandCreator_status = new WeakMap(), _BinaryCommandCreator_maxChunkLength = new WeakMap();
export function deserializeCommand(bytes) {
    const [commandCode] = bytes;
    const deserializedCommand = {
        c: commandCode,
    };
    let offset = 1;
    while (offset < bytes.length) {
        if (offset + 1 >= bytes.length) {
            throw new Error("Malformed command buffer: truncated name/type header");
        }
        const name = String.fromCharCode(bytes[offset]);
        offset++;
        const dataType = getDataTypeFromByte(bytes[offset]);
        switch (dataType) {
            case Serialization.SerializedItem.Int:
                {
                    const { number, byteLength } = Serialization.deserializeInt(bytes.subarray(offset));
                    deserializedCommand[name] = number;
                    offset += byteLength;
                }
                break;
            case Serialization.SerializedItem.SimilarIntArray:
                {
                    const { numbers, byteLength } = Serialization.deserializeUniqueSimilarIntArray(bytes.subarray(offset));
                    deserializedCommand[name] = numbers;
                    offset += byteLength;
                }
                break;
            case Serialization.SerializedItem.String:
                {
                    const { string, byteLength } = Serialization.deserializeString(bytes.subarray(offset));
                    deserializedCommand[name] = string;
                    offset += byteLength;
                }
                break;
        }
    }
    return validateCommand(deserializedCommand);
}
function getDataTypeFromByte(byte) {
    const typeCode = byte >> 4;
    if (typeCode <= Serialization.SerializedItem.Min ||
        typeCode >= Serialization.SerializedItem.Max) {
        throw new Error("Not existing type");
    }
    return typeCode;
}
function stringToUtf8CodesBuffer(string, length) {
    if (length && string.length !== length) {
        throw new Error("Wrong string length");
    }
    const buffer = new Uint8Array(length !== null && length !== void 0 ? length : string.length);
    for (let i = 0; i < string.length; i++)
        buffer[i] = string.charCodeAt(i);
    return buffer;
}
function* splitBufferToEqualChunks(buffer, chunksCount) {
    const chunkLength = Math.ceil(buffer.length / chunksCount);
    for (let i = 0; i < chunksCount; i++) {
        yield [i, buffer.subarray(i * chunkLength, (i + 1) * chunkLength)];
    }
}
function frameBuffer(buffer, frameStart, frameEnd) {
    const result = new Uint8Array(buffer.length + frameStart.length + frameEnd.length);
    result.set(frameStart);
    result.set(buffer, frameStart.length);
    result.set(frameEnd, frameStart.length + buffer.length);
    return result;
}
function areBuffersEqual(buffer1, buffer2, length) {
    for (let i = 0; i < length; i++) {
        if (buffer1[i] !== buffer2[i])
            return false;
    }
    return true;
}
function validateCommand(command) {
    switch (command.c) {
        case PeerCommandType.SegmentsAnnouncement:
            return command;
        case PeerCommandType.SegmentRequest:
            assertNumberFields(command, "i", "r");
            return command;
        case PeerCommandType.SegmentData:
            assertNumberFields(command, "i", "r", "s");
            return command;
        case PeerCommandType.SegmentAbsent:
        case PeerCommandType.CancelSegmentRequest:
        case PeerCommandType.SegmentDataSendingCompleted:
            assertNumberFields(command, "i", "r");
            return command;
        default:
            throw new Error(`Unknown peer command type: ${String(command.c)}`);
    }
}
function assertNumberFields(obj, ...fields) {
    for (const field of fields) {
        if (typeof obj[field] !== "number") {
            throw new Error(`Expected number field "${field}", got ${typeof obj[field]}`);
        }
    }
}
//# sourceMappingURL=binary-command-creator.js.map