export declare const PeerConnection: typeof RTCPeerConnection;
export declare const SessionDescription: typeof RTCSessionDescription;
/**
 * Safe, backward-compatible wrapper for RTCPeerConnection.createOffer.
 *
 * Falls back to legacy callback-based signature on older engines (like Chrome 50 and below)
 * while leveraging native Promises on modern browsers, avoiding runtime throwing or exception latency.
 */
export declare function safeCreateOffer(pc: RTCPeerConnection, options?: RTCOfferOptions): Promise<RTCSessionDescriptionInit>;
/**
 * Safe, backward-compatible wrapper for RTCPeerConnection.createAnswer.
 *
 * Falls back to legacy callback-based signature on older engines (like Chrome 50 and below)
 * while leveraging native Promises on modern browsers, avoiding runtime throwing or exception latency.
 */
export declare function safeCreateAnswer(pc: RTCPeerConnection, options?: RTCAnswerOptions): Promise<RTCSessionDescriptionInit>;
/**
 * Safe, backward-compatible wrapper for RTCPeerConnection.setLocalDescription.
 *
 * Falls back to legacy callback-based signature on older engines (like Chrome < 50)
 * while leveraging native Promises on modern browsers.
 */
export declare function safeSetLocalDescription(pc: RTCPeerConnection, description: RTCSessionDescriptionInit): Promise<void>;
/**
 * Safe, backward-compatible wrapper for RTCPeerConnection.setRemoteDescription.
 *
 * Falls back to legacy callback-based signature on older engines (like Chrome < 50)
 * while leveraging native Promises on modern browsers.
 */
export declare function safeSetRemoteDescription(pc: RTCPeerConnection, description: RTCSessionDescriptionInit): Promise<void>;
