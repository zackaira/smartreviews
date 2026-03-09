"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { MapPinIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/label";
import { Input } from "@/components/input";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/card";
import { useFormAction } from "@/lib/use-form-action";
import { submitConnectGoogle } from "../actions";
import { initialConnectGoogleState } from "../state";
import {
  useGooglePlacesScript,
  type GooglePlacesAutocomplete,
} from "./use-google-places-script";

/** Generic Place types we skip when picking a display category. */
const GENERIC_PLACE_TYPES = new Set([
  "establishment",
  "point_of_interest",
  "geocode",
  "premise",
  "subpremise",
]);

function formatPlaceCategory(types: string[] | undefined): string | null {
  if (!types?.length) return null;
  const meaningful = types.find(
    (t) => !GENERIC_PLACE_TYPES.has(t.toLowerCase()),
  );
  const raw = meaningful ?? types[0];
  return raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const inputClassName = cn(
  "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] h-auto w-full min-w-0 rounded-md border bg-transparent px-3 py-[10px] text-[15px] shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:opacity-50 md:text-[15px]",
  "aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
);

export function ConnectGoogleForm() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<GooglePlacesAutocomplete | null>(null);
  const { formAction, formKey, errors, values, message } = useFormAction(
    submitConnectGoogle,
    initialConnectGoogleState,
  );
  const [inputValue, setInputValue] = useState(values.query ?? "");
  const [selectedPlace, setSelectedPlace] = useState<{
    placeId: string;
    name: string;
    formattedAddress: string;
    photoUrl: string | null;
    category: string | null;
  } | null>(null);

  const googleReady = useGooglePlacesScript();

  const handlePlaceChange = useCallback(() => {
    const autocomplete = autocompleteRef.current;
    if (!autocomplete) return;
    const place = autocomplete.getPlace();
    const placeId = place.place_id;
    const name = place.name ?? "";
    const formattedAddress = place.formatted_address ?? "";
    const photoUrl =
      place.photos?.[0]?.getUrl?.({ maxWidth: 400, maxHeight: 300 }) ?? null;
    const category = formatPlaceCategory(place.types);
    if (placeId) {
      setSelectedPlace({ placeId, name, formattedAddress, photoUrl, category });
      setInputValue(name);
    }
  }, []);

  useEffect(() => {
    if (!googleReady || !searchInputRef.current) return;
    const input = searchInputRef.current;
    if (autocompleteRef.current) return;

    const Autocomplete = window.google?.maps?.places?.Autocomplete;
    if (!Autocomplete) return;

    const id = setTimeout(() => {
      const el = searchInputRef.current;
      if (!el || autocompleteRef.current) return;
      const autocomplete = new Autocomplete(el, {
        types: ["establishment"],
        fields: ["place_id", "name", "formatted_address", "photos", "types"],
      });
      autocompleteRef.current = autocomplete;
      autocomplete.addListener("place_changed", handlePlaceChange);
    }, 100);
    return () => {
      clearTimeout(id);
      const ac = autocompleteRef.current;
      if (ac) {
        window.google?.maps?.event?.clearInstanceListeners(ac);
        autocompleteRef.current = null;
      }
    };
  }, [googleReady, handlePlaceChange]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setSelectedPlace(null);
  };

  const handleClearSelection = () => {
    setSelectedPlace(null);
    setInputValue("");
    searchInputRef.current?.focus();
  };

  useEffect(() => {
    setInputValue(values.query ?? "");
    setSelectedPlace(null);
  }, [formKey]);

  const queryValue = selectedPlace ? selectedPlace.placeId : inputValue;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-muted">
            <MapPinIcon className="size-5 text-muted-foreground" />
          </div>
          <CardTitle>Find your business</CardTitle>
          <CardDescription>
            Enter your Google Business Profile using one of the options below.
            If you manage the profile, we&apos;ll take you to Google to connect
            it. If someone else owns it, add their email and we&apos;ll send
            them a link to connect.
          </CardDescription>
        </CardHeader>
        <form action={formAction} noValidate key={formKey}>
          <CardContent className="space-y-4">
            {message && (
              <p className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-foreground">
                {message}
              </p>
            )}

            <div className="space-y-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="query">Google Business Profile name</Label>
                <input
                  ref={searchInputRef}
                  id="query"
                  type="text"
                  placeholder="Business name"
                  value={inputValue}
                  onChange={handleSearchInputChange}
                  autoComplete="off"
                  className={cn(
                    inputClassName,
                    errors.query &&
                      "border-destructive ring-2 ring-destructive/20 focus-visible:border-destructive focus-visible:ring-destructive/20",
                  )}
                  aria-invalid={!!errors.query}
                  aria-describedby={errors.query ? "query-error" : undefined}
                />
                <input type="hidden" name="query" value={queryValue} />
                {errors.query && (
                  <p
                    id="query-error"
                    role="alert"
                    className="text-sm text-destructive"
                  >
                    {errors.query}
                  </p>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Start typing your business name, then select your business from
                the drop-down list.
              </p>
              {!googleReady && (
                <p className="text-xs text-muted-foreground" role="status">
                  For search-as-you-type, set{" "}
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px]">
                    NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
                  </code>{" "}
                  and enable &quot;Maps JavaScript API&quot; and &quot;Places
                  API&quot; for that key in Google Cloud Console.
                </p>
              )}
            </div>

            <Input
              id="owner_email"
              name="owner_email"
              label="Profile owner email (optional)"
              placeholder="owner@example.com"
              type="email"
              defaultValue={values.owner_email}
              error={errors.owner_email}
            />
          </CardContent>
          <CardFooter className="border-t border-border pt-6">
            <SubmitButton pendingText="Finding…" className="w-full sm:w-auto">
              Continue
            </SubmitButton>
          </CardFooter>
        </form>
      </Card>

      {selectedPlace && (
        <div className="px-6">
          <div
            className="bg-white rounded-md border border-border p-3 text-sm shadow-md"
            data-testid="selected-place-preview"
          >
            <div className="flex items-center gap-3">
              {selectedPlace.photoUrl && (
                <div className="size-16 shrink-0 overflow-hidden rounded-md bg-muted">
                  <img
                    src={selectedPlace.photoUrl}
                    alt=""
                    className="size-full object-cover"
                    width={64}
                    height={64}
                  />
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="font-medium text-foreground">
                  {selectedPlace.name}

                  {selectedPlace.category && (
                    <span className="text-xs ml-4 bg-primary/10 px-1.5 py-0.5 rounded-sm text-primary font-medium">
                      {selectedPlace.category}
                    </span>
                  )}
                </p>

                {selectedPlace.formattedAddress && (
                  <p className="text-xs mt-0.5">
                    {selectedPlace.formattedAddress}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0 text-muted-foreground hover:text-foreground"
                onClick={handleClearSelection}
                aria-label="Change selection"
              >
                <XIcon className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
