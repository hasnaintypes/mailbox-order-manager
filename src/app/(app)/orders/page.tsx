import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { requireCustomer } from "@/auth/actor";
import { AutoRefresh } from "@/components/layout/auto-refresh";
import { PageHero } from "@/components/layout/page-hero";
import { EmptyState } from "@/components/orders/empty-state";
import { NewOrderDialog } from "@/components/orders/new-order-dialog";
import { OrderTable } from "@/components/orders/order-table";
import { StatCards } from "@/components/orders/stat-cards";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { greeting, nameFromEmail } from "@/lib/format";
import { listCustomerOrders } from "@/services/customer-orders";

export default async function CustomerOrdersPage() {
  const actor = await requireCustomer().catch(() => redirect("/"));
  const session = await auth();
  const { items } = await listCustomerOrders(actor.id, 1, 100);
  const inFlight = items.some((o) => o.status === "PENDING" || o.status === "PROVISIONING");
  const failed = items.filter((o) => o.status === "FAILED").length;

  return (
    <>
      <AutoRefresh active={inFlight} />
      <PageHero
        eyebrow="Customer portal"
        title={`${greeting()}, ${nameFromEmail(session?.user.email ?? "there")}`}
        description={
          inFlight
            ? "Your mailboxes are being provisioned — this page updates automatically."
            : failed
              ? `${failed} ${failed === 1 ? "order needs" : "orders need"} attention. Contact an admin to retry.`
              : "Order pre-warmed Google and Microsoft mailboxes and track every step."
        }
        actions={<NewOrderDialog />}
      />
      <StatCards statuses={items.map((o) => o.status)} />
      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="border-b py-4">
          <CardTitle>Your orders</CardTitle>
          <CardDescription>{items.length} {items.length === 1 ? "order" : "orders"}, newest first</CardDescription>
        </CardHeader>
        {items.length === 0 ? (
          <EmptyState title="No orders yet" description="Create your first order to get started." action={<NewOrderDialog />} />
        ) : (
          <OrderTable orders={items} basePath="/orders" />
        )}
      </Card>
    </>
  );
}
