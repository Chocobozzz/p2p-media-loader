/**
 * Copyright 2018 Novage LLC.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { EventEmitter } from "events";
import { Events, LoaderInterface, HybridLoader, HybridLoaderSettings } from "@peertube/p2p-media-loader-core";
import { SegmentManager, SegmentManagerSettings } from "./segment-manager.js";
import { HlsJsLoader } from "./hlsjs-loader.js";
import type { LoaderCallbacks, LoaderConfiguration, LoaderContext, LoaderStats } from "hls.js";
import { ByteRange } from "./byte-range.js";

export interface HlsJsEngineSettings {
    loader: Partial<HybridLoaderSettings>;
    segments: Partial<SegmentManagerSettings>;
}

interface LoaderImplInterface {
    abort(): void
}

export class Engine extends EventEmitter {
    public static isSupported(): boolean {
        return HybridLoader.isSupported();
    }

    private readonly loader: LoaderInterface;
    private readonly segmentManager: SegmentManager;

    private currentLoaders: LoaderImplInterface[] = []

    public constructor(settings: Partial<HlsJsEngineSettings> = {}) {
        super();

        this.loader = new HybridLoader(settings.loader);
        this.segmentManager = new SegmentManager(this.loader, settings.segments);

        Object.keys(Events)
            .map((eventKey) => Events[eventKey as keyof typeof Events])
            .forEach((event) => this.loader.on(event, (...args: unknown[]) => this.emit(event, ...args)));
    }

    public createLoaderClass(): new () => unknown {
        this.abortCurrentRequest()

        const engine = this; // eslint-disable-line @typescript-eslint/no-this-alias
        const loader = class implements LoaderImplInterface {
            private impl: HlsJsLoader;
            private context?: LoaderContext;
            private callbacks?: LoaderCallbacks<LoaderContext>;
            public stats: LoaderStats;

            constructor() {
                this.impl = new HlsJsLoader(engine.segmentManager);

                this.stats = this.impl.stats;
            }

            load = async (
                context: LoaderContext,
                config: LoaderConfiguration,
                callbacks: LoaderCallbacks<LoaderContext>
            ) => {
                if (context.url.endsWith('.m3u8') !== true) {
                    engine.addLoaderImpl(this);
                }

                this.context = context;
                this.callbacks = callbacks;
                await this.impl.load(context, config, callbacks);
            };

            abort = () => {
                if (this.context) {
                    this.impl.abort(this.context, this.callbacks);
                }
            };

            destroy = () => {
                if (this.context) {
                    this.impl.abort(this.context);
                }

                engine.removeLoaderImpl(this);
            };

            getResponseHeader = () => undefined;

            static getEngine = () => {
                return engine;
            };
        };

        return loader;
    }

    public async destroy(): Promise<void> {
        this.currentLoaders = [];

        await this.segmentManager.destroy();
    }

    public abortCurrentRequest (): void {
        for (const loader of this.currentLoaders) {
            loader.abort();
        }

        this.currentLoaders = [];
    }

    public getSettings(): {
        segments: SegmentManagerSettings;
        loader: unknown;
    } {
        return {
            segments: this.segmentManager.getSettings(),
            loader: this.loader.getSettings(),
        };
    }

    public getDetails(): unknown {
        return {
            loader: this.loader.getDetails(),
        };
    }

    public setPlayingSegment(url: string, byteRange: ByteRange, start: number, duration: number): void {
        this.segmentManager.setPlayingSegment(url, byteRange, start, duration);
    }

    public setPlayingSegmentByCurrentTime(playheadPosition: number): void {
        this.segmentManager.setPlayingSegmentByCurrentTime(playheadPosition);
    }

    private addLoaderImpl (loader: LoaderImplInterface): void {
        this.currentLoaders.push(loader);
    }

    private removeLoaderImpl (loader: LoaderImplInterface): void {
        this.currentLoaders = this.currentLoaders.filter(l => l !== loader);
    }
}

export interface Asset {
    masterSwarmId: string;
    masterManifestUri: string;
    requestUri: string;
    requestRange?: string;
    responseUri: string;
    data: ArrayBuffer | string;
}

export interface AssetsStorage {
    storeAsset(asset: Asset): Promise<void>;
    getAsset(requestUri: string, requestRange: string | undefined, masterSwarmId: string): Promise<Asset | undefined>;
    destroy(): Promise<void>;
}
