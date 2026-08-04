import { Stream } from "../types.js";
import { SegmentWithStream } from "../internal-types.js";
import { SegmentPlaybackStatuses } from "./stream.js";
export declare function getStreamString(stream: Stream): string;
export declare function getSegmentString(segment: SegmentWithStream): string;
export declare function getSegmentPlaybackStatusesString(statuses: SegmentPlaybackStatuses): string;
