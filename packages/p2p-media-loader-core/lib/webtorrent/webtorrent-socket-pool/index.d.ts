import { WebSocketClient } from "../websocket-client/index.js";
export type WebTorrentSocketPoolEventMap = {
    error: (error: Event, url: string) => void;
};
export declare class WebTorrentSocketPool {
    #private;
    addEventListener<K extends keyof WebTorrentSocketPoolEventMap>(eventName: K, listener: WebTorrentSocketPoolEventMap[K]): void;
    removeEventListener<K extends keyof WebTorrentSocketPoolEventMap>(eventName: K, listener: WebTorrentSocketPoolEventMap[K]): void;
    acquire(url: string): {
        client: WebSocketClient;
        release: () => void;
    };
    destroy(): void;
}
