export var PeerCommandType;
(function (PeerCommandType) {
    PeerCommandType[PeerCommandType["SegmentsAnnouncement"] = 0] = "SegmentsAnnouncement";
    PeerCommandType[PeerCommandType["SegmentRequest"] = 1] = "SegmentRequest";
    PeerCommandType[PeerCommandType["SegmentData"] = 2] = "SegmentData";
    PeerCommandType[PeerCommandType["SegmentDataSendingCompleted"] = 3] = "SegmentDataSendingCompleted";
    PeerCommandType[PeerCommandType["SegmentAbsent"] = 4] = "SegmentAbsent";
    PeerCommandType[PeerCommandType["CancelSegmentRequest"] = 5] = "CancelSegmentRequest";
})(PeerCommandType || (PeerCommandType = {}));
//# sourceMappingURL=types.js.map