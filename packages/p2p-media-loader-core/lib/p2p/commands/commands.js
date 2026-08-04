import { BinaryCommandCreator } from "./binary-command-creator.js";
import { PeerCommandType, } from "./types.js";
function serializeSegmentAnnouncementCommand(command, maxChunkSize) {
    const { c: commandCode, p: loadingByHttp, l: loaded } = command;
    const creator = new BinaryCommandCreator(commandCode, maxChunkSize);
    if (loaded === null || loaded === void 0 ? void 0 : loaded.length)
        creator.addUniqueSimilarIntArr("l", loaded);
    if (loadingByHttp === null || loadingByHttp === void 0 ? void 0 : loadingByHttp.length) {
        creator.addUniqueSimilarIntArr("p", loadingByHttp);
    }
    creator.complete();
    return creator.getResultBuffers();
}
function serializePeerSegmentCommand(command, maxChunkSize) {
    const creator = new BinaryCommandCreator(command.c, maxChunkSize);
    creator.addInteger("i", command.i);
    creator.addInteger("r", command.r);
    creator.complete();
    return creator.getResultBuffers();
}
function serializePeerSendSegmentCommand(command, maxChunkSize) {
    const creator = new BinaryCommandCreator(command.c, maxChunkSize);
    creator.addInteger("i", command.i);
    creator.addInteger("s", command.s);
    creator.addInteger("r", command.r);
    creator.complete();
    return creator.getResultBuffers();
}
function serializePeerSegmentRequestCommand(command, maxChunkSize) {
    const creator = new BinaryCommandCreator(command.c, maxChunkSize);
    creator.addInteger("i", command.i);
    creator.addInteger("r", command.r);
    if (command.b)
        creator.addInteger("b", command.b);
    creator.complete();
    return creator.getResultBuffers();
}
export function serializePeerCommand(command, maxChunkSize) {
    switch (command.c) {
        case PeerCommandType.CancelSegmentRequest:
        case PeerCommandType.SegmentAbsent:
        case PeerCommandType.SegmentDataSendingCompleted:
            return serializePeerSegmentCommand(command, maxChunkSize);
        case PeerCommandType.SegmentRequest:
            return serializePeerSegmentRequestCommand(command, maxChunkSize);
        case PeerCommandType.SegmentsAnnouncement:
            return serializeSegmentAnnouncementCommand(command, maxChunkSize);
        case PeerCommandType.SegmentData:
            return serializePeerSendSegmentCommand(command, maxChunkSize);
    }
}
//# sourceMappingURL=commands.js.map