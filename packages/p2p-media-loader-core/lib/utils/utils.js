export function getPromiseWithResolvers() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return {
        promise,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        resolve: resolve,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        reject: reject,
    };
}
export function queueMicrotask(fn) {
    void Promise.resolve().then(fn);
}
export function joinChunks(chunks, totalBytes) {
    totalBytes !== null && totalBytes !== void 0 ? totalBytes : (totalBytes = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0));
    const buffer = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
        buffer.set(chunk, offset);
        offset += chunk.byteLength;
    }
    return buffer;
}
export function getPercent(numerator, denominator) {
    return (numerator / denominator) * 100;
}
export function getRandomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}
export function getWeightedRandomItem(items, weightAccessor) {
    if (items.length === 0)
        throw new Error("Cannot get item from empty array");
    if (items.length === 1)
        return items[0];
    let totalWeight = 0;
    const weights = items.map((item) => {
        const weight = weightAccessor(item);
        totalWeight += weight;
        return weight;
    });
    let randomWeight = Math.random() * totalWeight;
    for (let i = 0; i < items.length; i++) {
        randomWeight -= weights[i];
        if (randomWeight <= 0)
            return items[i];
    }
    return items[items.length - 1];
}
export function utf8ToUintArray(utf8String) {
    return new TextEncoder().encode(utf8String);
}
export function hexToUtf8(hexString) {
    const bytes = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
        bytes[i / 2] = parseInt(hexString.slice(i, i + 2), 16);
    }
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
}
export function* arrayBackwards(arr) {
    for (let i = arr.length - 1; i >= 0; i--) {
        yield arr[i];
    }
}
function isObject(item) {
    return !!item && typeof item === "object" && !Array.isArray(item);
}
function isArray(item) {
    return Array.isArray(item);
}
export function filterUndefinedProps(obj) {
    function filter(obj) {
        if (isObject(obj)) {
            const result = {};
            Object.keys(obj).forEach((key) => {
                if (obj[key] !== undefined) {
                    const value = filter(obj[key]);
                    if (value !== undefined) {
                        result[key] = value;
                    }
                }
            });
            return result;
        }
        else {
            return obj;
        }
    }
    return filter(obj);
}
export function deepCopy(item) {
    if (isArray(item)) {
        return item.map((element) => deepCopy(element));
    }
    else if (isObject(item)) {
        const copy = {};
        for (const key of Object.keys(item)) {
            copy[key] = deepCopy(item[key]);
        }
        return copy;
    }
    else {
        return item;
    }
}
export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
export function overrideConfig(target, updates, defaults = {}) {
    if (typeof target !== "object" ||
        target === null ||
        typeof updates !== "object" ||
        updates === null) {
        return target;
    }
    Object.keys(updates).forEach((key) => {
        const keyStr = typeof key === "symbol" ? key.toString() : String(key);
        if (key === "__proto__" || key === "constructor" || key === "prototype") {
            throw new Error(`Attempt to modify restricted property '${keyStr}'`);
        }
        const updateValue = updates[key];
        const defaultValue = defaults[key];
        if (key in target) {
            if (updateValue === undefined) {
                target[key] =
                    defaultValue === undefined
                        ? undefined
                        : defaultValue;
            }
            else {
                target[key] = updateValue;
            }
        }
    });
    return target;
}
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function mergeAndFilterConfig(options) {
    const { defaultConfig, baseConfig = {}, specificStreamConfig = {} } = options;
    const mergedConfig = deepCopy(Object.assign(Object.assign(Object.assign({}, defaultConfig), baseConfig), specificStreamConfig));
    const keysOfT = Object.keys(defaultConfig);
    const filteredConfig = {};
    keysOfT.forEach((key) => {
        if (key in mergedConfig) {
            filteredConfig[key] = mergedConfig[key];
        }
    });
    return filteredConfig;
}
//# sourceMappingURL=utils.js.map