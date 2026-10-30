import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { requireAdmin } from "@/auth/actor";
import { AutoRefresh } from "@/components/layout/auto-refresh";
import { PageHero } from "@/components/layout/page-hero";
import { AdminFilters } from "@/components/orders/admin-filters";
import { EmptyState } from "@/components/orders/empty-state";
import { OrderTable } from "@/components/orders/order-table";
import { RetryButton } from "@/components/orders/retry-button";
import { StatCards } from "@/components/orders/stat-cards";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { greeting, nameFromEmail } from "@/lib/format";
import { adminOrderFiltersSchema } from "@/lib/validation";
import { getOrderStatusCounts, listAdminOrders } from "@/services/admin-orders";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requireAdmin().catch(() => redirect("/"));
  const session = await auth();

  const cleaned = Object.fromEntries(Object.entries(await searchParams).filter(([, value]) => value));
  const parsed = adminOrderFiltersSchema.safeParse({ pageSize: 10, ...cleaned });
  const filters = parsed.success ? parsed.data : { page: 1, pageSize: 10 };
  const [result, statuses] = await Promise.all([listAdminOrders(filters), getOrderStatusCounts()]);
  const inFlight = statuses.some((s) => s === "PENDING" || s === "PROVISIONING");
  const failed = statuses.filter((s) => s === "FAILED").length;

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
      <PageHero
        eyebrow="Admin console"
        title={`${greeting()}, ${nameFromEmail(session?.user.email ?? "admin")}`}
        description={
          failed
            ? `${failed} failed ${failed === 1 ? "order is" : "orders are"} waiting for a retry.`
            : "All customer orders are healthy. Nothing needs a retry right now."
        }
      />
      <StatCards statuses={statuses} />
      <Card className="gap-0 overflow-hidden p-0">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b py-4">
          <div>
            <CardTitle>All orders</CardTitle>
            <CardDescription>{result.total} matching {result.total === 1 ? "order" : "orders"}</CardDescription>
          </div>
          <AdminFilters status={filters.status} provider={filters.provider} />
        </CardHeader>
        {result.items.length === 0 ? (
          <EmptyState title="No orders match" description="Try clearing the filters." />
        ) : (
          <OrderTable
            orders={result.items}
            basePath="/admin/orders"
            renderAction={(order) => (order.status === "FAILED" ? <RetryButton orderId={order.id} /> : null)}
          />
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3 text-sm text-muted-foreground">
          <span>Page {result.page} of {result.totalPages}</span>
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
      </Card>
    </>
  );
}
