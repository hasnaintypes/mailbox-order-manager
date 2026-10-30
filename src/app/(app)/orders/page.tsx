import Link from "next/link";
import { redirect } from "next/navigation";

import { requireCustomer } from "@/auth/actor";
import { StatusBadge } from "@/components/orders/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listCustomerOrders } from "@/services/customer-orders";

export default async function CustomerOrdersPage() {
  const actor = await requireCustomer().catch(() => redirect("/"));
  const { items } = await listCustomerOrders(actor.id, 1, 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My orders</h1>
        <Link href="/orders/new" className={buttonVariants()}>New order</Link>
      </div>
      {items.length === 0 ? (
        <p className="text-muted-foreground">No orders yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Domain</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Mailboxes</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((order) => (
              <TableRow key={order.id}>
                <TableCell><Link className="underline" href={`/orders/${order.id}`}>{order.domain}</Link></TableCell>
                <TableCell className="capitalize">{order.provider}</TableCell>
                <TableCell>{order.mailboxCount}</TableCell>
                <TableCell><StatusBadge status={order.status} /></TableCell>
                <TableCell className="text-xs">{order.createdAt.toISOString().slice(0, 16).replace("T", " ")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
