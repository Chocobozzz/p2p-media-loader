export declare class DataChannelSender {
    #private;
    private readonly channel;
    private readonly maxMessageSize;
    constructor(channel: RTCDataChannel, maxMessageSize: number);
    sendData(data: ArrayBuffer | ArrayBufferView<ArrayBuffer>, onChunkSent?: (chunkSize: number) => void): Promise<void>;
    cancel(): void;
}
