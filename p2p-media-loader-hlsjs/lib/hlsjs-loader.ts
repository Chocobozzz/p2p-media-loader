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

import Debug from "debug";
import { Events, LoaderInterface, Segment } from "@peertube/p2p-media-loader-core";
import { byteRangeToString, getByteRange } from "./byte-range";
import { SegmentManager } from "./segment-manager";
import type { LoaderCallbacks, LoaderConfiguration, LoaderContext, LoaderStats } from "hls.js";

interface LoadError {
    code: number;
    text: string;
}

export class HlsJsLoader {
    private readonly debug = Debug("p2pml:hlsjs-loader");

    private interval: ReturnType<typeof setInterval> | undefined;

    public stats: LoaderStats = {
        loaded: 0,
        total: 0,
        aborted: false,
        retry: 0,
        chunkCount: 0,
        bwEstimate: 0,
        loading: {
            start: 0,
            end: 0,
            first: 0,
        },
        parsing: {
            start: 0,
            end: 0,
        },
        buffering: {
            start: 0,
            end: 0,
            first: 0,
        },
    };

    private boundOnSegmentAbort = this.onSegmentAbort.bind(this);
    private boundOnUpdateSegmentSize = this.onUpdateSegmentSize.bind(this);
    private boundOnUpdateLoaded = this.onUpdateLoaded.bind(this);
    private boundOnSegmentStartLoad = this.onSegmentStartLoad.bind(this);

    private context: LoaderContext | undefined;
    private callbacks: LoaderCallbacks<LoaderContext> | undefined;
    private loader: LoaderInterface | undefined;
    private byteRange: { offset: number, length: number } | undefined;

    private debugId = "";

    public constructor(private readonly segmentManager: SegmentManager) {
    }

    public async load(
        context: LoaderContext,
        _config: LoaderConfiguration,
        callbacks: LoaderCallbacks<LoaderContext>
    ): Promise<void> {
        this.context = context;
        this.callbacks = callbacks;

        HlsJsLoader.updateStatsToStartLoading(this.stats);

        if (((this.context as unknown) as { type: unknown }).type) {
            this.debug(`Loading playlist ${this.context.url}.`);

            try {
                const result = await this.segmentManager.loadPlaylist(this.context.url);

                this.debug(`Playlist ${this.context.url} loaded.`);
                this.successPlaylist(result, this.context, this.callbacks);
            } catch (e) {
                this.error(e as LoadError, this.context, this.callbacks);
            }
        } else if (((this.context as unknown) as { frag: unknown }).frag) {
            this.loader = this.segmentManager.loader;

            this.byteRange = getByteRange(this.context);
            this.debugId = this.byteRange
                ? `${this.context.url} / ${this.byteRange.offset}`
                : this.context.url;

            this.debug(`Loading fragment ${this.debugId}.`);

            // We may be downloading the segment by P2P, so we don"t care about the stats sent to HLS ABR
            this.interval = setInterval(() => HlsJsLoader.updateStatsToStartLoading(this.stats), 200);

            this.loader.on(Events.SegmentAbort, this.boundOnSegmentAbort);
            this.loader.on(Events.SegmentSize, this.boundOnUpdateSegmentSize);
            this.loader.on(Events.SegmentStartLoad, this.boundOnSegmentStartLoad);

            try {
                const result = await this.segmentManager.loadSegment(this.context.url, this.byteRange);
                const { content } = result;
                if (content) {
                    this.successSegment(content, this.context, this.callbacks);

                    this.debug(`Loaded fragment ${this.debugId}.`);
                } else {
                    this.cleanup();
                    this.debug(`Loaded empty fragment ${this.debugId} (aborted?).`);
                }
            } catch (e) {
                setTimeout(() => this.error(e as LoadError, this.context!, this.callbacks!), 0);

                this.debug(`Error in fragment ${this.debugId} loading.`, e);
            }
        } else {
            console.warn("Unknown load request", this.context);
        }
    }

    public abort(context: LoaderContext, callbacks?: LoaderCallbacks<LoaderContext>): void {
        if (this.stats.loading.end || this.stats.aborted) return;

        this.debug(`Aborting by hls.js fragment ${this.debugId} loading.`);

        this.cleanup();

        this.segmentManager.abortSegment(context.url, getByteRange(context));
        this.stats.aborted = true;

        const onAbort = callbacks?.onAbort;
        if (onAbort) {
            onAbort(this.stats, context, undefined);
        }
    }

    private successPlaylist(
        xhr: { response: string; responseURL: string },
        context: LoaderContext,
        callbacks: LoaderCallbacks<LoaderContext>
    ): void {
        this.cleanup();

        const now = performance.now();

        this.stats.loading.end = now;
        this.stats.loaded = xhr.response.length;
        this.stats.total = xhr.response.length;

        callbacks.onSuccess(
            {
                url: xhr.responseURL,
                data: xhr.response,
            },
            this.stats,
            context,
            undefined
        );
    }

    private successSegment(
        content: ArrayBuffer,
        context: LoaderContext,
        callbacks: LoaderCallbacks<LoaderContext>
    ): void {
        this.cleanup();

        const now = performance.now();

        this.stats.loading.end = now;
        this.stats.loaded = content.byteLength;
        this.stats.total = content.byteLength;

        if (callbacks.onProgress) {
            callbacks.onProgress(this.stats, context, content, undefined);
        }

        callbacks.onSuccess(
            {
                url: context.url,
                data: content,
            },
            this.stats,
            context,
            undefined
        );
    }

    private error(
        error: { code: number; text: string },
        context: LoaderContext,
        callbacks: LoaderCallbacks<LoaderContext>
    ): void {
        this.cleanup();

        callbacks.onError(error, context, undefined);
    }

    private cleanup () {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
        }

        if (this.loader) {
            this.loader.off(Events.SegmentStartLoad, this.boundOnSegmentStartLoad);
            this.loader.off(Events.SegmentSize, this.boundOnUpdateSegmentSize);
            this.loader.off(Events.PieceBytesDownloaded, this.boundOnUpdateLoaded);
            this.loader.off(Events.SegmentAbort, this.boundOnSegmentAbort);
        }
    }

    private onSegmentAbort (segment: Segment) {
        if (!this.isSegment(segment)) return;

        this.debug(`Aborting by p2p-media-loader fragment ${this.debugId || ""}.`);
        this.stats.aborted = true;

        const onAbort = this.callbacks?.onAbort;
        if (onAbort) {
            onAbort(this.stats, this.context as LoaderContext, undefined);
        }

        this.cleanup();
    }

    private onUpdateSegmentSize (segment: Segment, size: number) {
        if (!this.isSegment(segment)) return;

        this.stats.total = size;
    }

    private onUpdateLoaded (_type: unknown, segment: Segment, bytes: number) {
        if (!this.isSegment(segment)) return;

        this.stats.loaded += bytes;
    }

    private onSegmentStartLoad (method: "http" | "p2p", segment: Segment) {
        if (!this.interval || method !== "http" || !this.isSegment(segment)) return;

        clearInterval(this.interval);
        this.interval = undefined;

        HlsJsLoader.updateStatsToStartLoading(this.stats);

        (this.loader as LoaderInterface).on(Events.PieceBytesDownloaded, this.boundOnUpdateLoaded);
    };

    private isSegment (segment: Segment) {
        return segment.url === (this.context as LoaderContext).url && segment.range === byteRangeToString(this.byteRange);
    }

    private static updateStatsToStartLoading (stats: LoaderStats) {
        if (stats.aborted) return;

        const start = performance.now();
        stats.loading.start = start;
        stats.loading.first = start;
    }
}
