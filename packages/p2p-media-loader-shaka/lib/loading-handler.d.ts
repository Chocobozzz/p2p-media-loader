import type shaka from "shaka-player/dist/shaka-player.compiled.d.ts";
import { StreamInfo, Shaka, Stream } from "./types.js";
import { Core } from "p2p-media-loader-core";
type LoadingHandlerParams = Parameters<shaka.extern.SchemePlugin>;
type Response = shaka.extern.Response;
type LoadingHandlerResult = shaka.extern.IAbortableOperation<Response>;
export declare class Loader {
    private readonly shaka;
    private readonly core;
    readonly streamInfo: StreamInfo;
    private loadArgs;
    constructor(shaka: Shaka, core: Core<Stream>, streamInfo: StreamInfo);
    private defaultLoad;
    load(...args: LoadingHandlerParams): LoadingHandlerResult;
    private handleManifestLoading;
    private loadSegment;
    private setManifestResponseUrl;
}
export {};
