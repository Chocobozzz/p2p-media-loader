var _a, _b, _c, _d;
// Since this library runs exclusively in the browser window context, we target
// the global 'window' directly. We use a fallback to an empty object for SSR/testing environments.
const win = (typeof window !== "undefined"
    ? window
    : {});
export const PeerConnection = ((_b = (_a = win.RTCPeerConnection) !== null && _a !== void 0 ? _a : win.webkitRTCPeerConnection) !== null && _b !== void 0 ? _b : win.mozRTCPeerConnection);
export const SessionDescription = ((_d = (_c = win.RTCSessionDescription) !== null && _c !== void 0 ? _c : win.webkitRTCSessionDescription) !== null && _d !== void 0 ? _d : win.mozRTCSessionDescription);
/**
 * Detects whether the current browser environment natively supports Promise-based WebRTC APIs
 * (specifically pc.createOffer and pc.createAnswer).
 *
 * For example:
 * - Chrome < 50: Callback-only for all WebRTC APIs.
 * - Chrome 50: Promise support for setLocalDescription/setRemoteDescription, but callback-only for createOffer/createAnswer.
 * - Chrome 51+: Promise support for all WebRTC APIs.
 *
 * Probing this statically once at startup prevents the need to repeatedly execute throw/catch blocks
 * during runtime connection negotiations, avoiding unnecessary exception-handling overhead.
 */
const supportsPromiseWebRTC = (() => {
    // Guard for SSR/test environments where no WebRTC APIs exist
    if (!win.RTCPeerConnection &&
        !win.webkitRTCPeerConnection &&
        !win.mozRTCPeerConnection) {
        return false;
    }
    let pc;
    try {
        pc = new PeerConnection();
        const p = pc.createOffer();
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (typeof (p === null || p === void 0 ? void 0 : p.then) === "function") {
            p.catch(() => {
                /* suppress unhandled rejection from probe */
            });
            return true;
        }
    }
    catch (_a) {
        // Fallback to legacy callback-based APIs
    }
    finally {
        try {
            pc === null || pc === void 0 ? void 0 : pc.close();
        }
        catch (_b) {
            // ignore
        }
    }
    return false;
})();
/**
 * Safe, backward-compatible wrapper for RTCPeerConnection.createOffer.
 *
 * Falls back to legacy callback-based signature on older engines (like Chrome 50 and below)
 * while leveraging native Promises on modern browsers, avoiding runtime throwing or exception latency.
 */
export function safeCreateOffer(pc, options) {
    if (supportsPromiseWebRTC) {
        return pc.createOffer(options);
    }
    return new Promise((resolve, reject) => {
        try {
            pc.createOffer(resolve, reject, options);
        }
        catch (err) {
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            reject(err);
        }
    });
}
/**
 * Safe, backward-compatible wrapper for RTCPeerConnection.createAnswer.
 *
 * Falls back to legacy callback-based signature on older engines (like Chrome 50 and below)
 * while leveraging native Promises on modern browsers, avoiding runtime throwing or exception latency.
 */
export function safeCreateAnswer(pc, options) {
    if (supportsPromiseWebRTC) {
        return pc.createAnswer(options);
    }
    return new Promise((resolve, reject) => {
        try {
            pc.createAnswer(resolve, reject, options);
        }
        catch (err) {
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            reject(err);
        }
    });
}
/**
 * Safe, backward-compatible wrapper for RTCPeerConnection.setLocalDescription.
 *
 * Falls back to legacy callback-based signature on older engines (like Chrome < 50)
 * while leveraging native Promises on modern browsers.
 */
export function safeSetLocalDescription(pc, description) {
    if (supportsPromiseWebRTC) {
        return pc.setLocalDescription(description);
    }
    return new Promise((resolve, reject) => {
        try {
            pc.setLocalDescription(description, resolve, reject);
        }
        catch (err) {
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            reject(err);
        }
    });
}
/**
 * Safe, backward-compatible wrapper for RTCPeerConnection.setRemoteDescription.
 *
 * Falls back to legacy callback-based signature on older engines (like Chrome < 50)
 * while leveraging native Promises on modern browsers.
 */
export function safeSetRemoteDescription(pc, description) {
    if (supportsPromiseWebRTC) {
        return pc.setRemoteDescription(description);
    }
    return new Promise((resolve, reject) => {
        try {
            pc.setRemoteDescription(description, resolve, reject);
        }
        catch (err) {
            // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
            reject(err);
        }
    });
}
//# sourceMappingURL=webrtc-utils.js.map