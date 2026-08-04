import { PACKAGE_VERSION } from "./version.js";
export const TRACKER_CLIENT_VERSION_PREFIX = `-PM${formatVersion(PACKAGE_VERSION)}-`;
const HASH_SYMBOLS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const PEER_ID_LENGTH = 20;
export function generatePeerId(trackerClientVersionPrefix) {
    const trackerClientId = [trackerClientVersionPrefix];
    const randomCharsCount = PEER_ID_LENGTH - trackerClientVersionPrefix.length;
    for (let i = 0; i < randomCharsCount; i++) {
        trackerClientId.push(HASH_SYMBOLS[Math.floor(Math.random() * HASH_SYMBOLS.length)]);
    }
    return trackerClientId.join("");
}
function formatVersion(versionString) {
    const splittedVersion = versionString.split(".");
    const v0 = `00${splittedVersion[0]}`.slice(-2);
    const v1 = `00${splittedVersion[1]}`.slice(-2);
    return `${v0}${v1}`;
}
//# sourceMappingURL=peer.js.map