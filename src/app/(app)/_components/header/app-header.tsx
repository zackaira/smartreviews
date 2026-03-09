import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import { UserMenu } from "./user-menu";

type AppHeaderProps = {
  userName: string;
  signOut: () => Promise<void>;
  leading?: React.ReactNode;
};

export function AppHeader({ userName, signOut, leading }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-14 w-full items-center justify-between gap-2 px-4 md:px-6">
        <div className="flex items-center gap-2">
          {leading}
          <Link
            href="/dashboard"
            className="font-semibold text-primary hover:text-foreground/90"
          >
            Smart Reviews
          </Link>
        </div>
        <div className="flex items-center gap-1">
          <UserMenu userName={userName} signOut={signOut} />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
