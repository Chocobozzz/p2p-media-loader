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
var _ResizableUint8Array_instances, _ResizableUint8Array_bytes, _ResizableUint8Array_length, _ResizableUint8Array_addBytes;
import { joinChunks } from "../../utils/utils.js";
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder("utf8");
// restricted up to 16 item types (4 bits to type definition)
export var SerializedItem;
(function (SerializedItem) {
    SerializedItem[SerializedItem["Min"] = -1] = "Min";
    SerializedItem[SerializedItem["Int"] = 0] = "Int";
    SerializedItem[SerializedItem["SimilarIntArray"] = 1] = "SimilarIntArray";
    SerializedItem[SerializedItem["String"] = 2] = "String";
    SerializedItem[SerializedItem["Max"] = 3] = "Max";
})(SerializedItem || (SerializedItem = {}));
export function getRequiredBytesForInt(num) {
    if (num === 0)
        return 1;
    const necessaryBits = Math.floor(Math.log2(Math.abs(num))) + 2;
    return Math.ceil(necessaryBits / 8);
}
function intToBytes(num) {
    const isNegative = num < 0;
    const bytesAmountNumber = getRequiredBytesForInt(num);
    const bytes = new Uint8Array(bytesAmountNumber);
    num = Math.abs(num);
    for (let i = 0; i < bytesAmountNumber; i++) {
        const shift = 8 * (bytesAmountNumber - 1 - i);
        const byte = Math.floor(num / Math.pow(2, shift)) & 0xff;
        bytes[i] = byte;
    }
    if (isNegative)
        bytes[0] = bytes[0] | 0b10000000;
    return bytes;
}
function bytesToInt(bytes) {
    const byteLength = bytes.length;
    const getNumberPart = (byte, i) => {
        const shift = 8 * (byteLength - 1 - i);
        return byte * Math.pow(2, shift);
    };
    // ignore first bit of first byte as it is sign bit
    let number = getNumberPart(bytes[0] & 0b01111111, 0);
    for (let i = 1; i < byteLength; i++) {
        number += getNumberPart(bytes[i], i);
    }
    if ((bytes[0] & 0b10000000) >> 7 !== 0)
        number = -number;
    return number;
}
export function serializeInt(num) {
    const numBytes = intToBytes(num);
    const numberMetadata = (SerializedItem.Int << 4) | numBytes.length;
    return new Uint8Array([numberMetadata, ...numBytes]);
}
export function deserializeInt(bytes) {
    if (bytes.length === 0)
        throw new Error("Buffer is too short");
    const metadata = bytes[0];
    const code = metadata >> 4;
    if (code !== SerializedItem.Int) {
        throw new Error("Trying to deserialize integer with invalid serialized item code");
    }
    const numberBytesLength = metadata & 0b1111;
    if (numberBytesLength === 0) {
        throw new Error("Invalid integer: zero byte length");
    }
    if (numberBytesLength > 7) {
        throw new Error("Invalid integer: byte length exceeds safe integer limit");
    }
    const start = 1;
    const end = start + numberBytesLength;
    if (bytes.length < end) {
        throw new Error("Buffer is too short");
    }
    return {
        number: bytesToInt(bytes.subarray(start, end)),
        byteLength: numberBytesLength + 1,
    };
}
export function serializeUniqueSimilarIntArray(numbers) {
    var _a;
    const commonPartNumbersMap = new Map();
    for (const number of numbers) {
        const diffByte = number & 0xff;
        const common = number - diffByte;
        const bytes = (_a = commonPartNumbersMap.get(common)) !== null && _a !== void 0 ? _a : new ResizableUint8Array();
        if (!bytes.length)
            commonPartNumbersMap.set(common, bytes);
        bytes.push(diffByte);
    }
    const result = new ResizableUint8Array();
    result.push([SerializedItem.SimilarIntArray << 4, commonPartNumbersMap.size]);
    for (const [commonPart, binaryArray] of commonPartNumbersMap) {
        const { length } = binaryArray;
        const commonPartWithLength = commonPart + (length & 0xff);
        binaryArray.unshift(serializeInt(commonPartWithLength));
        result.push(binaryArray.getBuffer());
    }
    return result.getBuffer();
}
export function deserializeUniqueSimilarIntArray(bytes) {
    if (bytes.length < 2)
        throw new Error("Buffer is too short");
    const [codeByte, commonPartArraysAmount] = bytes;
    const code = codeByte >> 4;
    if (code !== SerializedItem.SimilarIntArray) {
        throw new Error("Trying to deserialize similar int array with invalid serialized item code");
    }
    let offset = 2;
    const originalIntArr = [];
    for (let i = 0; i < commonPartArraysAmount; i++) {
        const { number: commonPartWithLength, byteLength } = deserializeInt(bytes.subarray(offset));
        offset += byteLength;
        const arrayLength = commonPartWithLength & 0xff;
        const actualLength = arrayLength === 0 ? 256 : arrayLength;
        const commonPart = commonPartWithLength - arrayLength;
        if (offset + actualLength > bytes.length) {
            throw new Error("Malformed similar int array: buffer too short");
        }
        for (let j = 0; j < actualLength; j++) {
            const diffPart = bytes[offset];
            originalIntArr.push(commonPart + diffPart);
            offset++;
        }
    }
    return { numbers: originalIntArr, byteLength: offset };
}
export function serializeString(string) {
    const encoded = textEncoder.encode(string);
    const { length } = encoded;
    if (length > 4095) {
        throw new Error("String exceeds maximum length of 4095 bytes");
    }
    const bytes = new ResizableUint8Array();
    bytes.push([
        (SerializedItem.String << 4) | ((length >> 8) & 0x0f),
        length & 0xff,
    ]);
    bytes.push(encoded);
    return bytes.getBuffer();
}
export function deserializeString(bytes) {
    if (bytes.length < 2)
        throw new Error("Buffer is too short");
    const [codeByte, lengthByte] = bytes;
    const code = codeByte >> 4;
    if (code !== SerializedItem.String) {
        throw new Error("Trying to deserialize bytes (sting) with invalid serialized item code.");
    }
    const length = ((codeByte & 0x0f) << 8) | lengthByte;
    if (bytes.length < length + 2) {
        throw new Error("Malformed string: buffer too short");
    }
    const stringBytes = bytes.subarray(2, length + 2);
    const string = textDecoder.decode(stringBytes);
    return { string, byteLength: length + 2 };
}
export class ResizableUint8Array {
    constructor() {
        _ResizableUint8Array_instances.add(this);
        _ResizableUint8Array_bytes.set(this, []);
        _ResizableUint8Array_length.set(this, 0);
    }
    push(bytes) {
        __classPrivateFieldGet(this, _ResizableUint8Array_instances, "m", _ResizableUint8Array_addBytes).call(this, bytes, "end");
    }
    unshift(bytes) {
        __classPrivateFieldGet(this, _ResizableUint8Array_instances, "m", _ResizableUint8Array_addBytes).call(this, bytes, "start");
    }
    getBytesChunks() {
        return __classPrivateFieldGet(this, _ResizableUint8Array_bytes, "f");
    }
    getBuffer() {
        return joinChunks(__classPrivateFieldGet(this, _ResizableUint8Array_bytes, "f"), __classPrivateFieldGet(this, _ResizableUint8Array_length, "f"));
    }
    get length() {
        return __classPrivateFieldGet(this, _ResizableUint8Array_length, "f");
    }
}
_ResizableUint8Array_bytes = new WeakMap(), _ResizableUint8Array_length = new WeakMap(), _ResizableUint8Array_instances = new WeakSet(), _ResizableUint8Array_addBytes = function _ResizableUint8Array_addBytes(bytes, position) {
    let bytesToAdd;
    if (bytes instanceof Uint8Array) {
        bytesToAdd = bytes;
    }
    else if (Array.isArray(bytes)) {
        bytesToAdd = new Uint8Array(bytes);
    }
    else {
        bytesToAdd = new Uint8Array([bytes]);
    }
    __classPrivateFieldSet(this, _ResizableUint8Array_length, __classPrivateFieldGet(this, _ResizableUint8Array_length, "f") + bytesToAdd.length, "f");
    __classPrivateFieldGet(this, _ResizableUint8Array_bytes, "f")[position === "start" ? "unshift" : "push"](bytesToAdd);
};
//# sourceMappingURL=binary-serialization.js.map