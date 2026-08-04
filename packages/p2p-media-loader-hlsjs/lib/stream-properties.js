export function getVideoStreamProperties(level) {
    const { bitrate, maxBitrate, videoCodec, width, height } = level;
    // maxBitrate tracks the peak BANDWIDTH tag, whereas bitrate tracks AVERAGE-BANDWIDTH.
    // We prioritize maxBitrate to universally match Shaka's variant.bandwidth parsing.
    const b = maxBitrate !== null && maxBitrate !== void 0 ? maxBitrate : bitrate;
    const isMissingMetadata = b === 0;
    return {
        bitrate: b,
        codecs: isMissingMetadata ? undefined : videoCodec,
        width: isMissingMetadata ? undefined : width,
        height: isMissingMetadata ? undefined : height,
        frameRate: isMissingMetadata ? undefined : level.attrs["FRAME-RATE"],
        videoRange: isMissingMetadata ? undefined : level.attrs["VIDEO-RANGE"],
    };
}
export function getAudioStreamProperties(track) {
    const { audioCodec, lang, channels, name } = track;
    return {
        bitrate: 0, // Match Shaka behavior for audio stream without variant
        codecs: audioCodec,
        language: lang,
        channels,
        name,
    };
}
//# sourceMappingURL=stream-properties.js.map