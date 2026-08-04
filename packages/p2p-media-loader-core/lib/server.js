/**
 * Server-side stream identity helpers (`p2p-media-loader-core/server`).
 *
 * This entry point is environment-agnostic (no DOM dependencies; requires
 * Node.js 16+ for the global `btoa` and `TextEncoder`) and lets a server
 * reproduce the exact identity values clients compute for a stream — for
 * example, to allowlist the announced infohashes on a private tracker.
 *
 * The package is published as ESM only. From a CommonJS project, load it
 * with a dynamic import (works on all supported Node.js versions):
 * ```typescript
 * const { computeInfoHash } = await import("p2p-media-loader-core/server");
 * ```
 * (Node.js 20.17+ can also `require()` it directly.)
 *
 * With the default client configuration:
 * ```typescript
 * import { computeStreamSwarmId, computeInfoHash } from "p2p-media-loader-core/server";
 *
 * const infoHash = computeInfoHash(
 *   computeStreamSwarmId({
 *     swarmId, // the configured swarmId or the manifest URL without query parameters
 *     streamType: "main",
 *     properties: { bitrate, codecs, width, height },
 *   }),
 * );
 * ```
 *
 * With a custom `streamSwarmIdBuilder`, apply `computeInfoHash` to the same string
 * the builder returns on the client.
 *
 * @module
 */
export { computeStreamIdentityHash, computeStreamSwarmId, buildStreamSwarmId, computeInfoHash, PEER_PROTOCOL_VERSION, } from "./stream-identity.js";
//# sourceMappingURL=server.js.map