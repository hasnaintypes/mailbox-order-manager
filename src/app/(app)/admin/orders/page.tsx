import Link from "next/link";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/auth/actor";
import { RetryButton } from "@/components/orders/retry-button";
import { StatusBadge } from "@/components/orders/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ORDER_STATUSES, PROVIDER_NAMES } from "@/domain/orders/status";
import { adminOrderFiltersSchema } from "@/lib/validation";
import { listAdminOrders } from "@/services/admin-orders";

type SearchParams = Record<string, string | undefined>;

const selectClass = "h-9 rounded-md border border-input bg-transparent px-3 text-sm";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin().catch(() => redirect("/"));

  const raw = await searchParams;
  // Blank filter values ("All") are dropped; invalid ones fall back to defaults.
  const cleaned = Object.fromEntries(Object.entries(raw).filter(([, value]) => value));
  const parsed = adminOrderFiltersSchema.safeParse({ pageSize: 10, ...cleaned });
  const filters = parsed.success ? parsed.data : { page: 1, pageSize: 10 };
  const result = await listAdminOrders(filters);

  const link = (page: number) => {
    const query = new URLSearchParams();
    if (filters.status) query.set("status", filters.status);
    if (filters.provider) query.set("provider", filters.provider);
    query.set("page", String(page));
    return `/admin/orders?${query}`;
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">All orders</h1>

      <form className="flex flex-wrap items-center gap-3" method="get">
        <select name="status" defaultValue={filters.status ?? ""} className={selectClass} aria-label="Status">
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <select name="provider" defaultValue={filters.provider ?? ""} className={selectClass} aria-label="Provider">
          <option value="">All providers</option>
          {PROVIDER_NAMES.map((provider) => <option key={provider} value={provider}>{provider}</option>)}
        </select>
        <Button type="submit" variant="outline" size="sm">Filter</Button>
      </form>

      {result.items.length === 0 ? (
        <p className="text-muted-foreground">No orders match.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Domain</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Mailboxes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.map((order) => (
              <TableRow key={order.id}>
                <TableCell><Link className="underline" href={`/admin/orders/${order.id}`}>{order.domain}</Link></TableCell>
                <TableCell className="capitalize">{order.provider}</TableCell>
                <TableCell>{order.mailboxCount}</TableCell>
                <TableCell><StatusBadge status={order.status} /></TableCell>
                <TableCell className="text-xs">{order.createdAt.toISOString().slice(0, 16).replace("T", " ")}</TableCell>
                <TableCell>{order.status === "FAILED" ? <RetryButton orderId={order.id} /> : null}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="flex items-center justify-between text-sm">
        <span>Page {result.page} of {result.totalPages} · {result.total} orders</span>
        <div className="flex gap-2">
          {result.page > 1 ? <Link className={buttonVariants({ variant: "outline", size: "sm" })} href={link(result.page - 1)}>Previous</Link> : null}
          {result.page < result.totalPages ? <Link className={buttonVariants({ variant: "outline", size: "sm" })} href={link(result.page + 1)}>Next</Link> : null}
        </div>
      </div>
    </div>
  );
}
