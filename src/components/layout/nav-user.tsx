"use client";

import { ChevronsUpDownIcon, LogOutIcon, ShieldCheckIcon, UserIcon } from "lucide-react";
import { signOut } from "next-auth/react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { nameFromEmail } from "@/lib/format";
import { cn } from "@/lib/utils";

type NavUserProps = {
  email: string;
  role: "customer" | "admin";
  /** Avatar-only trigger for the mobile header. */
  compact?: boolean;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
};

function UserSummary({ email }: Pick<NavUserProps, "email">) {
  const name = nameFromEmail(email);

  return (
    <>
      <Avatar className="size-8 rounded-lg">
        <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
          {name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{name}</span>
        <span className="truncate text-xs text-muted-foreground">{email}</span>
      </div>
    </>
  );
}

export function NavUser({ email, role, compact, side = "right", className }: NavUserProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex w-full items-center gap-2 rounded-lg p-2 text-left outline-none transition-colors hover:bg-sidebar-accent focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-sidebar-accent",
          compact && "w-auto p-1",
          className,
        )}
        aria-label="User menu"
      >
        {compact ? (
          <Avatar className="size-8 rounded-lg">
            <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
              {nameFromEmail(email).charAt(0)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <>
            <UserSummary email={email} />
            <ChevronsUpDownIcon className="ml-auto size-4 text-muted-foreground" />
          </>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56 rounded-lg" side={side} align="end" sideOffset={8}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-sm">
              <UserSummary email={email} />
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem disabled className="capitalize">
            {role === "admin" ? <ShieldCheckIcon /> : <UserIcon />}
            {role} account
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ redirectTo: "/login" })}>
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
