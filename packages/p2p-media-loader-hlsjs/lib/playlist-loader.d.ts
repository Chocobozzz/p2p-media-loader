import { HlsConfig, Loader, LoaderCallbacks, LoaderConfiguration, LoaderContext, LoaderStats, PlaylistLoaderContext } from "hls.js";
export declare class PlaylistLoaderBase implements Loader<PlaylistLoaderContext> {
    #private;
    context: PlaylistLoaderContext;
    stats: LoaderStats;
    constructor(config: HlsConfig);
    load(context: LoaderContext, config: LoaderConfiguration, callbacks: LoaderCallbacks<LoaderContext>): void;
    abort(): void;
    destroy(): void;
}
