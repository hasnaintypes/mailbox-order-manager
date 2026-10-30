import { redirect } from "next/navigation";

import { requireCustomer } from "@/auth/actor";
import { AutoRefresh } from "@/components/layout/auto-refresh";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/orders/empty-state";
import { NewOrderDialog } from "@/components/orders/new-order-dialog";
import { OrderTable } from "@/components/orders/order-table";
import { StatCards } from "@/components/orders/stat-cards";
import { Card } from "@/components/ui/card";
import { listCustomerOrders } from "@/services/customer-orders";

export default async function CustomerOrdersPage() {
  const actor = await requireCustomer().catch(() => redirect("/"));
  const { items } = await listCustomerOrders(actor.id, 1, 100);
  const inFlight = items.some((o) => o.status === "PENDING" || o.status === "PROVISIONING");

  const newOrder = <NewOrderDialog />;

  return (
    <>
      <AutoRefresh active={inFlight} />
      <PageHeader title="My orders" description="Track your mailbox orders and their provisioning progress." actions={newOrder} />
      <StatCards statuses={items.map((o) => o.status)} />
      <Card className="gap-0 overflow-hidden p-0">
        {items.length === 0 ? (
          <EmptyState title="No orders yet" description="Create your first order to get started." action={newOrder} />
        ) : (
          <OrderTable orders={items} basePath="/orders" />
        )}
      </Card>
    </>
  );
}
