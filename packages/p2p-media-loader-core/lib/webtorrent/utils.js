export function getRTCError(event, fallbackMessage = "RTC error") {
    var _a, _b;
    const errorEvent = event;
    if (errorEvent.error instanceof Error) {
        return errorEvent.error;
    }
    const msg = (_b = (_a = errorEvent.error) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : fallbackMessage;
    return new Error(msg);
}
export function getRTCErrorMessage(event, fallbackMessage = "RTC error") {
    return getRTCError(event, fallbackMessage).message;
}
export function isTerminalConnectionState(state) {
    // "disconnected" is technically a transient ICE state that can recover,
    // but for live video streaming we treat it as terminal: dropping the peer
    // immediately and reconnecting via the tracker is faster than waiting for
    // a stale connection to potentially recover.
    return state === "failed" || state === "closed" || state === "disconnected";
}
//# sourceMappingURL=utils.js.map