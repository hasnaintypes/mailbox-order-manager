import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "admin";

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <nav className="flex items-center gap-4 text-sm font-medium">
            <span className="font-semibold">Mailbox Orders</span>
            {isAdmin ? (
              <Link href="/admin/orders">All orders</Link>
            ) : (
              <>
                <Link href="/orders">My orders</Link>
                <Link href="/orders/new">New order</Link>
              </>
            )}
          </nav>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
            className="flex items-center gap-3 text-sm"
          >
            <span className="text-muted-foreground">{session.user.email} ({session.user.role})</span>
            <Button variant="outline" size="sm" type="submit">Sign out</Button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
