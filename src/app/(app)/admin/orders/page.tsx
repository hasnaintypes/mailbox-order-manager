import { redirect } from "next/navigation";

import { requireAdmin } from "@/auth/actor";
import { AutoRefresh } from "@/components/layout/auto-refresh";
import { PageHeader } from "@/components/layout/page-header";
import { AdminFilters } from "@/components/orders/admin-filters";
import { EmptyState } from "@/components/orders/empty-state";
import { OrderTable } from "@/components/orders/order-table";
import { RetryButton } from "@/components/orders/retry-button";
import { Card } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { adminOrderFiltersSchema } from "@/lib/validation";
import { listAdminOrders } from "@/services/admin-orders";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin().catch(() => redirect("/"));

  const cleaned = Object.fromEntries(Object.entries(await searchParams).filter(([, value]) => value));
  const parsed = adminOrderFiltersSchema.safeParse({ pageSize: 10, ...cleaned });
  const filters = parsed.success ? parsed.data : { page: 1, pageSize: 10 };
  const result = await listAdminOrders(filters);
  const inFlight = result.items.some((o) => o.status === "PENDING" || o.status === "PROVISIONING");

  const href = (page: number) => {
    const query = new URLSearchParams();
    if (filters.status) query.set("status", filters.status);
    if (filters.provider) query.set("provider", filters.provider);
    query.set("page", String(page));
    return `/admin/orders?${query}`;
  };

  return (
    <>
      <AutoRefresh active={inFlight} />
      <PageHeader title="All orders" description="Every customer order. Retry failed orders to send them back to the queue." />
      <AdminFilters status={filters.status} provider={filters.provider} />
      <Card className="gap-0 overflow-hidden p-0">
        {result.items.length === 0 ? (
          <EmptyState title="No orders match" description="Try clearing the filters." />
        ) : (
          <OrderTable
            orders={result.items}
            basePath="/admin/orders"
            renderAction={(order) => (order.status === "FAILED" ? <RetryButton orderId={order.id} /> : null)}
          />
        )}
      </Card>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>
          Page {result.page} of {result.totalPages} · {result.total} {result.total === 1 ? "order" : "orders"}
        </span>
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            {result.page > 1 ? (
              <PaginationItem><PaginationPrevious href={href(result.page - 1)} /></PaginationItem>
            ) : null}
            {result.page < result.totalPages ? (
              <PaginationItem><PaginationNext href={href(result.page + 1)} /></PaginationItem>
            ) : null}
          </PaginationContent>
        </Pagination>
      </div>
    </>
  );
}
