"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SettingsIcon,
  LayoutDashboardIcon,
  Link2Icon,
  LayoutIcon,
  StarIcon,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/sidebar";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/platforms", label: "Connect Platforms", icon: Link2Icon },
  { href: "/reviews", label: "Review Management", icon: StarIcon },
  { href: "/widgets", label: "Website Widgets", icon: LayoutIcon },
  {
    href: "/settings",
    label: "Company Settings",
    icon: SettingsIcon,
  },
] as const;

export function SidebarNavItems() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map(({ href, label, icon: Icon }) => (
        <SidebarMenuItem key={href} className="mb-2">
          <SidebarMenuButton
            asChild
            isActive={pathname === href}
            tooltip={label}
            className="py-6 px-3.5"
          >
            <Link href={href}>
              <Icon className="size-4" />
              <span>{label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
