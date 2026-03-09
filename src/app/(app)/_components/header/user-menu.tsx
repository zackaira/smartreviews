"use client";

import Link from "next/link";
import {
  ChevronDownIcon,
  CreditCardIcon,
  LogOutIcon,
  SettingsIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu";
import { Button } from "@/components/button";
import { MountedOnly } from "@/components/mounted-only";

type UserMenuProps = {
  userName: string;
  signOut: () => Promise<void>;
};

function UserMenuContent({ userName, signOut }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 font-normal">
          <span className="max-w-48 truncate">{userName}</span>
          <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-60">
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <SettingsIcon className="size-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/billing">
            <CreditCardIcon className="size-4" />
            Billing
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={signOut}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full cursor-pointer">
              <LogOutIcon className="size-4" />
              Sign out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UserMenu(props: UserMenuProps) {
  return (
    <MountedOnly
      placeholder={
        <div
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-normal"
          aria-hidden
        >
          <span className="max-w-48 truncate">{props.userName}</span>
          <ChevronDownIcon className="size-4 shrink-0 opacity-50" />
        </div>
      }
    >
      <UserMenuContent {...props} />
    </MountedOnly>
  );
}
