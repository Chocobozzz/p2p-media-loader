import type shaka from "shaka-player/dist/shaka-player.compiled.d.ts";
import { Shaka } from "./types.js";
export declare class ManifestParserDecorator implements shaka.extern.ManifestParser {
    private readonly shaka;
    private readonly originalManifestParser;
    private readonly debug;
    private readonly isHls;
    private segmentManager?;
    private player?;
    constructor(shaka: Readonly<Shaka>, originalManifestParser: shaka.extern.ManifestParser);
    configure(config: shaka.extern.ManifestConfiguration): unknown;
    banLocation(uri: string): unknown;
    onInitialVariantChosen(variant: shaka.extern.Variant): unknown;
    private setP2PMediaLoaderData;
    start(uri: string, playerInterface: shaka.extern.ManifestParser.PlayerInterface): Promise<shaka.extern.Manifest>;
    stop(): Promise<any>;
    update(): unknown;
    setMediaElement(mediaElement: HTMLMediaElement | null): unknown;
    onExpirationUpdated(sessionId: string, expiration: number): unknown;
    private processStreams;
    private hookSegmentIndex;
    private hookHlsStreamMediaSequenceTimeMaps;
}
export declare class HlsManifestParser extends ManifestParserDecorator {
    constructor(shaka: Shaka);
}
export declare class DashManifestParser extends ManifestParserDecorator {
    constructor(shaka: Shaka);
}
