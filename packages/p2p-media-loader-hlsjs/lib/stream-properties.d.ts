import type { LevelParsed, ManifestLoadedData } from "hls.js";
import { StreamProperties } from "p2p-media-loader-core";
export declare function getVideoStreamProperties(level: LevelParsed & {
    maxBitrate?: number;
}): StreamProperties;
export declare function getAudioStreamProperties(track: ManifestLoadedData["audioTracks"][number]): StreamProperties;
