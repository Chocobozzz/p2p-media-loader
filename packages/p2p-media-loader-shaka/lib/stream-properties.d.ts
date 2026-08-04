import type shaka from "shaka-player/dist/shaka-player.compiled.d.ts";
import { StreamProperties } from "p2p-media-loader-core";
export declare function getVideoStreamProperties(variant: shaka.extern.Variant, video: shaka.extern.Stream): StreamProperties;
export declare function getAudioStreamProperties(variant: shaka.extern.Variant, audio: shaka.extern.Stream, isMain: boolean): StreamProperties;
