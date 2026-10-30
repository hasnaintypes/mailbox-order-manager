import { InboxIcon } from "lucide-react";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { auth } from "@/auth";
import { AppNav, type NavItem } from "@/components/layout/app-nav";
import { NavUser } from "@/components/layout/nav-user";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const CUSTOMER_NAV: NavItem[] = [
  { href: "/orders", label: "My orders", icon: "orders" },
];
const ADMIN_NAV: NavItem[] = [{ href: "/admin/orders", label: "All orders", icon: "admin" }];

function Brand() {
  return (
    <div className="flex items-center gap-2 font-semibold">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <InboxIcon className="size-4" />
      </span>
      Mailbox Orders
    </div>
  );
}

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { email, role } = session.user;
  const items = role === "admin" ? ADMIN_NAV : CUSTOMER_NAV;

  return (
    <div className="flex min-h-svh">
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r bg-sidebar lg:flex">
        <div className="flex h-14 items-center border-b px-5">
          <Brand />
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          <p className="px-3 pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {role === "admin" ? "Administration" : "Orders"}
          </p>
          <AppNav items={items} />
        </div>
        <div className="border-t p-3">
          <NavUser email={email} role={role} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 lg:hidden">
            <Brand />
            <Separator orientation="vertical" className="h-5" />
            <AppNav items={items} orientation="horizontal" />
          </div>
          <p className="hidden text-sm text-muted-foreground lg:block">
            {role === "admin" ? "Admin console" : "Customer portal"}
          </p>
          <NavUser email={email} role={role} compact side="bottom" className="lg:hidden" />
          <div className="hidden items-center gap-3 lg:flex">
            <span className="text-sm text-muted-foreground">{email}</span>
            <Badge variant="secondary" className="capitalize">{role}</Badge>
          </div>
        </header>
        <main className="w-full flex-1 space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
