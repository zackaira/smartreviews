/**
 * Types for Google Business Profile / Places identification.
 * Used only by the Google connection feature.
 */

export type GoogleBusinessIdentifier =
  | { type: "place_id"; value: string }
  | { type: "url"; value: string }
  | { type: "name_address"; name: string; address: string };

export interface ResolvedPlace {
  placeId: string;
  formattedAddress?: string;
}
