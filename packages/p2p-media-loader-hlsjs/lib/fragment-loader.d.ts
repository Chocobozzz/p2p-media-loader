import type { FragmentLoaderContext, HlsConfig, Loader, LoaderCallbacks, LoaderConfiguration, LoaderContext, LoaderStats } from "hls.js";
import { Core } from "p2p-media-loader-core";
export declare class FragmentLoaderBase implements Loader<FragmentLoaderContext> {
    #private;
    context: FragmentLoaderContext;
    config: LoaderConfiguration | null;
    stats: LoaderStats;
    constructor(config: HlsConfig, core: Core);
    load(context: FragmentLoaderContext, config: LoaderConfiguration, callbacks: LoaderCallbacks<LoaderContext>): void;
    abort(): void;
    destroy(): void;
}
