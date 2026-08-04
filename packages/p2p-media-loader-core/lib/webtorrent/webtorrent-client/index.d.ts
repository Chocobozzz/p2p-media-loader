import { WebSocketClient } from "../websocket-client/index.js";
import { TrackerError, TrackerWarning, PeerConnectError } from "../../types.js";
export type WebTorrentClientEventMap = {
    peerConnected: (event: {
        peerId: string;
        connection: RTCPeerConnection;
        channel: RTCDataChannel;
    }) => void;
    peerConnectFailed: (event: {
        peerId: string;
        error: PeerConnectError;
    }) => void;
    warning: (warning: TrackerWarning) => void;
    error: (error: TrackerError) => void;
};
export interface WebTorrentClientConfig {
    wsClient: WebSocketClient;
    infoHash: string;
    peerId: string;
    rtcConfig?: () => RTCConfiguration | undefined;
    channelConfig?: RTCDataChannelInit;
    offerTimeout?: () => number;
    offersCount?: () => number;
    iceGatheringTimeout?: () => number;
    connectionTimeout?: () => number;
    claimPeer?: (peerId: string) => boolean;
    shouldGenerateOffers?: () => boolean;
}
export declare class WebTorrentClient {
    #private;
    constructor(config: WebTorrentClientConfig);
    addEventListener<K extends keyof WebTorrentClientEventMap>(eventName: K, listener: WebTorrentClientEventMap[K]): void;
    removeEventListener<K extends keyof WebTorrentClientEventMap>(eventName: K, listener: WebTorrentClientEventMap[K]): void;
    start(): void;
    destroy(): void;
}
