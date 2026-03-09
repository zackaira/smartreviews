/**
 * Resolve a Google Business identifier to a Place ID.
 * No UI or server actions; pure resolution and validation.
 * Callers (server actions) pass API key when using name+address.
 */

import type { GoogleBusinessIdentifier, ResolvedPlace } from "./types";

/** Place IDs typically start with ChIJ (Google's prefix); allow other known prefixes. */
const PLACE_ID_PREFIX = /^[A-Za-z0-9_-]{20,}$/;

/**
 * Validates Place ID format (heuristic). Google Place IDs are long alphanumeric strings.
 */
export function isValidPlaceId(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length >= 20 && PLACE_ID_PREFIX.test(trimmed);
}

/**
 * Extract Place ID from a Google Maps URL.
 * Supports: place_id=ChIJ... in query string.
 * Returns null if not found or URL doesn't look like Google Maps.
 */
export function parsePlaceIdFromMapsUrl(url: string): { placeId: string } | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    if (
      !host.includes("google.com") &&
      !host.includes("maps.google") &&
      !host.includes("goo.gl/maps")
    ) {
      return null;
    }

    const placeId = parsed.searchParams.get("place_id") ?? null;
    if (placeId && isValidPlaceId(placeId)) {
      return { placeId };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Resolve name + address to a Place ID via Google Places API (Text Search).
 * When apiKey is missing, returns null so the feature still works with Place ID or URL only.
 */
export async function resolvePlaceIdFromNameAndAddress(
  name: string,
  address: string,
  apiKey: string | undefined
): Promise<ResolvedPlace | null> {
  if (!apiKey?.trim()) return null;

  const query = `${name.trim()} ${address.trim()}`.trim();
  if (!query) return null;

  const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
  url.searchParams.set("query", query);
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) return null;

  const data = (await res.json()) as {
    status?: string;
    results?: Array<{
      place_id?: string;
      formatted_address?: string;
    }>;
  };

  if (data.status !== "OK" || !data.results?.[0]) return null;
  const first = data.results[0];
  if (!first.place_id || !isValidPlaceId(first.place_id)) return null;

  return {
    placeId: first.place_id,
    formattedAddress: first.formatted_address ?? undefined,
  };
}

const GOOGLE_MAPS_URL_REGEX =
  /^https?:\/\/(www\.)?(google\.com\/maps|maps\.google\.com|goo\.gl\/maps)/i;

/**
 * Parse a single user input (name, location, Place ID, or Google Maps URL) into an identifier.
 */
export function parseSingleInputToIdentifier(
  input: string
): GoogleBusinessIdentifier | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (isValidPlaceId(trimmed)) return { type: "place_id", value: trimmed };
  try {
    if (GOOGLE_MAPS_URL_REGEX.test(trimmed)) return { type: "url", value: trimmed };
  } catch {
    // not a URL
  }
  return { type: "name_address", name: trimmed, address: "" };
}

/**
 * Resolve any supported identifier to a Place ID.
 * Uses API key only for name_address type; optional so feature works without Places API.
 */
export async function resolveToPlaceId(
  identifier: GoogleBusinessIdentifier,
  placesApiKey: string | undefined
): Promise<ResolvedPlace | null> {
  switch (identifier.type) {
    case "place_id":
      return isValidPlaceId(identifier.value)
        ? { placeId: identifier.value.trim() }
        : null;
    case "url": {
      const parsed = parsePlaceIdFromMapsUrl(identifier.value);
      return parsed;
    }
    case "name_address":
      return resolvePlaceIdFromNameAndAddress(
        identifier.name,
        identifier.address,
        placesApiKey
      );
    default:
      return null;
  }
}
