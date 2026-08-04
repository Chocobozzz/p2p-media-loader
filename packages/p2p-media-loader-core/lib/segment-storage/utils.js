export const getStorageItemId = (streamId, segmentId) => `${streamId}|${segmentId}`;
export const isAndroid = (userAgent) => /Android/i.test(userAgent);
export const isIPadOrIPhone = (userAgent) => /iPad|iPhone/i.test(userAgent);
export const isAndroidWebview = (userAgent) => /Android/i.test(userAgent) &&
    (/; wv\)/i.test(userAgent) || !/Chrome|Firefox/i.test(userAgent));
//# sourceMappingURL=utils.js.map