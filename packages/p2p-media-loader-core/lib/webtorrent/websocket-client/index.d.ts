export type WebSocketClientEventMap = {
    connected: () => void;
    disconnected: () => void;
    reconnecting: () => void;
    error: (error: Event) => void;
    message: (data: ArrayBuffer | string) => void;
};
export type WebSocketClientState = "connecting" | "connected" | "reconnecting" | "disconnected" | "disposed";
export interface WebSocketClientConfig {
    url: string;
    initialDelay?: number;
    maxDelay?: number;
    jitterMultiplier?: number;
}
export declare class WebSocketClient {
    #private;
    constructor(config: WebSocketClientConfig);
    get state(): WebSocketClientState;
    addEventListener<K extends keyof WebSocketClientEventMap>(eventName: K, listener: WebSocketClientEventMap[K]): void;
    removeEventListener<K extends keyof WebSocketClientEventMap>(eventName: K, listener: WebSocketClientEventMap[K]): void;
    connect(): void;
    send(data: string | ArrayBuffer | Blob | ArrayBufferView<ArrayBuffer>): void;
    dispose(): void;
}
