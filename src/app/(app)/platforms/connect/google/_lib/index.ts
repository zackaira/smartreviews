/**
 * Google Business / Places domain logic for the connection feature.
 * Single entrypoint; no UI or server actions here.
 */

export type { GoogleBusinessIdentifier, ResolvedPlace } from "./types";
export {
  isValidPlaceId,
  parsePlaceIdFromMapsUrl,
  parseSingleInputToIdentifier,
  resolvePlaceIdFromNameAndAddress,
  resolveToPlaceId,
} from "./resolve-place-id";
