import { MapPinIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/card";

export function LocationsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Locations</CardTitle>
        <CardDescription>Manage your business locations.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            <MapPinIcon className="size-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              Location management coming soon
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              You&apos;ll be able to add and manage multiple business locations
              here.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
