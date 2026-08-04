import { PeerError, TrackerError, TrackerWarning, PeerConnectError } from "../../types.js";
import { WebTorrentSocketPool } from "../webtorrent-socket-pool/index.js";
export interface WebTorrentManagerConfig {
    infoHash: string;
    peerId: string;
    trackerUrls: string[];
    rtcConfig?: () => RTCConfiguration | undefined;
    channelConfig?: RTCDataChannelInit;
    socketPool: WebTorrentSocketPool;
    offersCount?: () => number;
    offerTimeout?: () => number;
    iceGatheringTimeout?: () => number;
    connectionTimeout?: () => number;
    maxPeers?: () => number;
    maxPeersMultiplier?: () => number;
}
export type WebTorrentManagerEventMap = {
    peerConnected: (event: {
        peerId: string;
        connection: RTCPeerConnection;
        channel: RTCDataChannel;
        trackerUrl: string;
        close: (error?: PeerError) => void;
    }) => void;
    peerDisconnected: (event: {
        peerId: string;
        trackerUrl: string;
    } & ({
        error: PeerError;
        disconnectReason?: never;
    } | {
        error?: never;
        disconnectReason: string;
    })) => void;
    peerConnectFailed: (event: {
        peerId: string;
        trackerUrl: string;
        error: PeerConnectError;
    }) => void;
    warning: (event: {
        trackerUrl: string;
        warning: TrackerWarning;
    }) => void;
    error: (event: {
        trackerUrl: string;
        error: TrackerError;
    }) => void;
};
export declare class WebTorrentManager {
    #private;
    constructor(config: WebTorrentManagerConfig);
    addEventListener<K extends keyof WebTorrentManagerEventMap>(eventName: K, listener: WebTorrentManagerEventMap[K]): void;
    removeEventListener<K extends keyof WebTorrentManagerEventMap>(eventName: K, listener: WebTorrentManagerEventMap[K]): void;
    start(): void;
    destroy(): void;
}
