import type shaka from "shaka-player/dist/shaka-player.compiled.d.ts";
import { HookedStream, StreamInfo, Stream } from "./types.js";
import { Core, StreamProperties, StreamType } from "p2p-media-loader-core";
export declare class SegmentManager {
    private readonly core;
    private streamInfo;
    constructor(streamInfo: Readonly<StreamInfo>, core: Core<Stream>);
    setStream(shakaStream: HookedStream, type: StreamType, properties: StreamProperties): void;
    updateStreamSegments(shakaStream: HookedStream, segmentReferences?: shaka.media.SegmentReference[]): void;
    private processDashSegmentReferences;
    private processHlsSegmentReferences;
}
