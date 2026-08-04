import type { ManifestLoadedData, LevelUpdatedData, AudioTrackLoadedData } from "hls.js";
import { Core } from "p2p-media-loader-core";
export declare class SegmentManager {
    core: Core;
    private readonly logger;
    constructor(core: Core);
    processMainManifest(data: ManifestLoadedData): void;
    private addStream;
    updatePlaylist(data: LevelUpdatedData | AudioTrackLoadedData): void;
}
