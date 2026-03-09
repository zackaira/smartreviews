"use client";

import { useEffect, useState } from "react";

export interface GooglePlacePhoto {
  getUrl: (opts?: { maxWidth?: number; maxHeight?: number }) => string;
}

export interface GooglePlaceResult {
  place_id?: string;
  name?: string;
  formatted_address?: string;
  photos?: GooglePlacePhoto[];
  types?: string[];
}

export interface GooglePlacesAutocomplete {
  addListener: (event: string, handler: () => void) => void;
  getPlace: () => GooglePlaceResult;
}

declare global {
  interface Window {
    __googleMapsCallback?: () => void;
    google?: {
      maps: {
        event?: { clearInstanceListeners: (instance: unknown) => void };
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            opts?: { types?: string[]; fields?: string[] }
          ) => GooglePlacesAutocomplete;
        };
      };
    };
  }
}

/**
 * Loads the Google Maps JavaScript API with the Places library for Autocomplete.
 * Uses NEXT_PUBLIC_GOOGLE_PLACES_API_KEY or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
 * In Google Cloud, enable "Maps JavaScript API" and "Places API" for the key.
 */
export function useGooglePlacesScript(): boolean {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key =
      process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY?.trim() ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
    if (!key) return;

    const markLoaded = () => setLoaded(true);

    if (window.google?.maps?.places) {
      markLoaded();
      return;
    }

    const existing = document.querySelector(
      'script[src^="https://maps.googleapis.com/maps/api/js"]'
    );
    if (existing) {
      const id = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(id);
          markLoaded();
        }
      }, 100);
      return () => clearInterval(id);
    }

    window.__googleMapsCallback = markLoaded;
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places&callback=__googleMapsCallback`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      window.__googleMapsCallback = undefined;
    };
    document.head.appendChild(script);

    const pollId = setInterval(() => {
      if (window.google?.maps?.places) {
        clearInterval(pollId);
        markLoaded();
      }
    }, 150);
    return () => {
      window.__googleMapsCallback = undefined;
      clearInterval(pollId);
    };
  }, []);

  return loaded;
}
