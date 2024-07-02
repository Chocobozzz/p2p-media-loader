/**
 * @license Apache-2.0
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

/* eslint-disable */

export const version = "0.6.2";
export * from "./engine.js";
export * from "./segment-manager.js";

import Debug from 'debug';
import { Engine } from "./engine.js";

const debug = Debug("p2pml:hlsjs-init");

declare global {
    interface Window {
        p2pml: Record<string, unknown>;
    }
}
export function initHlsJsPlayer(videojsPlayer: any, hlsjs: any): void {
    if (hlsjs && hlsjs.config && hlsjs.config.loader && typeof hlsjs.config.loader.getEngine === "function") {
        initHlsJsEvents(videojsPlayer, hlsjs, hlsjs.config.loader.getEngine());
    }
}

function initHlsJsEvents(player: any, hlsjs: any, engine: Engine): void {
    const onSeek = function () {
        debug("Player seeking.")

        // Abort current HTTP/P2P request so HLS is not stuck with a P2P request when moving current video player time
        // to a previously loaded fragment
        engine.abortCurrentRequest();
    }

    player.on('seeking', onSeek)

    hlsjs.on("hlsFragChanged", (_event: string, data: any) => {
        debug("HLS Frag changed.", data)

        const frag = data.frag;
        const byteRange =
            frag.byteRange.length !== 2
                ? undefined
                : { offset: frag.byteRange[0], length: frag.byteRange[1] - frag.byteRange[0] };
        engine.setPlayingSegment(frag.url, byteRange, frag.start, frag.duration);
    });

    hlsjs.on("hlsError", (_event: string, errorData: { details: string }) => {
        if (errorData.details === "bufferStalledError") {
            const htmlMediaElement = (player.media === undefined
                ? player.el_ // videojs-contrib-hlsjs
                : player.media) as HTMLMediaElement | undefined; // all others
            if (htmlMediaElement) {
                engine.setPlayingSegmentByCurrentTime(htmlMediaElement.currentTime);
            }
        }
    });

    hlsjs.on("hlsDestroying", async () => {
        try {
            await engine.destroy();
            player.off('seeking', onSeek)
        } catch (err) {
            console.error(err)
        }
    });
}
