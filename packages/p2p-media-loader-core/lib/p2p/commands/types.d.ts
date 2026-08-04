type BasePeerCommand<T extends PeerCommandType = PeerCommandType> = {
    c: T;
};
export declare const enum PeerCommandType {
    SegmentsAnnouncement = 0,
    SegmentRequest = 1,
    SegmentData = 2,
    SegmentDataSendingCompleted = 3,
    SegmentAbsent = 4,
    CancelSegmentRequest = 5
}
export type PeerSegmentCommand = BasePeerCommand<PeerCommandType.SegmentAbsent | PeerCommandType.CancelSegmentRequest | PeerCommandType.SegmentDataSendingCompleted> & {
    i: number;
    r: number;
};
export type PeerRequestSegmentCommand = BasePeerCommand<PeerCommandType.SegmentRequest> & {
    i: number;
    r: number;
    b?: number;
};
export type PeerSegmentAnnouncementCommand = BasePeerCommand<PeerCommandType.SegmentsAnnouncement> & {
    l?: number[];
    p?: number[];
};
export type PeerSendSegmentCommand = BasePeerCommand<PeerCommandType.SegmentData> & {
    i: number;
    r: number;
    s: number;
};
export type PeerCommand = PeerSegmentCommand | PeerRequestSegmentCommand | PeerSegmentAnnouncementCommand | PeerSendSegmentCommand;
export {};
