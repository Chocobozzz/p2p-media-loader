import type { StreamProperties, StreamType } from "./types.js";
/**
 * Version of the peer swarm protocol. Included in every stream swarm ID, so peers
 * with incompatible protocols never join the same swarm.
 *
 * Changing the identity derivation in any way requires bumping this version.
 */
export declare const PEER_PROTOCOL_VERSION = "v2";
/**
 * Computes a stable, unique identity hash for a stream based on its properties.
 * The result is identical for all peers regardless of the player in use or the
 * stream's position in the manifest.
 *
 * Uses a SHA-1 hash of the normalized properties, encoded to standard Base64.
 *
 * This function is environment-agnostic and can be used on a server (Node.js 16+)
 * to reproduce the identity hash a client computes for the same stream.
 */
export declare function computeStreamIdentityHash({ bitrate, codecs, width, height, language, channels, name, frameRate, videoRange, }: StreamProperties): string;
/**
 * Builds the default stream swarm ID from its components. The stream swarm ID is the
 * pre-hash string that defines which P2P swarm a stream belongs to;
 * its hash is the infohash announced to trackers (see {@link computeInfoHash}).
 */
export declare function buildStreamSwarmId(swarmId: string, streamType: StreamType, identityHash: string): string;
/**
 * Computes the default stream swarm ID for a stream from its raw properties.
 *
 * This is the derivation a client with no `streamSwarmIdBuilder` configured uses.
 * Run it on a server (Node.js 16+) to predict a stream's swarm ID — and, via
 * {@link computeInfoHash}, the exact infohash the client announces to trackers.
 */
export declare function computeStreamSwarmId(options: {
    swarmId: string;
    streamType: StreamType;
    properties: StreamProperties;
}): string;
/**
 * Computes the infohash announced to trackers for the given stream swarm ID.
 *
 * A BitTorrent tracker `infoHash` MUST be exactly 20 bytes.
 * We take 15 bytes of the binary SHA-1 and encode it to Base64.
 * This produces exactly a 20-character ASCII string (no padding).
 * Note: this is a 20-byte ASCII representation, not a standard
 * 20-byte binary SHA-1 infoHash.
 *
 * This function is environment-agnostic: use it on a server (Node.js 16+) to
 * compute the infohashes to allowlist on a private tracker.
 */
export declare function computeInfoHash(streamSwarmId: string): string;
