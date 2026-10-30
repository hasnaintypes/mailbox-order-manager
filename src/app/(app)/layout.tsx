import { InboxIcon, LogOutIcon } from "lucide-react";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { auth, signOut } from "@/auth";
import { AppNav, type NavItem } from "@/components/layout/app-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const CUSTOMER_NAV: NavItem[] = [
  { href: "/orders", label: "My orders" },
  { href: "/orders/new", label: "New order" },
];
const ADMIN_NAV: NavItem[] = [{ href: "/admin/orders", label: "All orders" }];

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { email, role } = session.user;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 font-semibold">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <InboxIcon className="size-4" />
              </span>
              Mailbox Orders
            </div>
            <AppNav items={role === "admin" ? ADMIN_NAV : CUSTOMER_NAV} />
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
            className="flex items-center gap-3"
          >
            <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>
            <Badge variant="secondary" className="capitalize">{role}</Badge>
            <Separator orientation="vertical" className="h-5" />
            <Button variant="ghost" size="sm" type="submit">
              <LogOutIcon /> Sign out
            </Button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">{children}</main>
    </div>
  );
}
