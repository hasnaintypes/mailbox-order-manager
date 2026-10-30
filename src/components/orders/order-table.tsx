import Link from "next/link";
import type { ReactNode } from "react";

import { StatusBadge } from "@/components/orders/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { capitalize, formatDateTime } from "@/lib/format";
import type { presentOrder } from "@/services/order-presenter";

type Order = ReturnType<typeof presentOrder>;

export function OrderTable({
  orders,
  basePath,
  renderAction,
}: {
  orders: Order[];
  basePath: string;
  renderAction?: (order: Order) => ReactNode;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="pl-4">Domain</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead>Mailboxes</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          {renderAction ? <TableHead className="pr-4 text-right">Actions</TableHead> : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="pl-4 font-medium">
              <Link className="hover:text-primary hover:underline" href={`${basePath}/${order.id}`}>
                {order.domain}
              </Link>
            </TableCell>
            <TableCell>{capitalize(order.provider)}</TableCell>
            <TableCell>{order.mailboxCount}</TableCell>
            <TableCell><StatusBadge status={order.status} /></TableCell>
            <TableCell className="text-muted-foreground">{formatDateTime(order.createdAt)}</TableCell>
            {renderAction ? <TableCell className="pr-4 text-right">{renderAction(order)}</TableCell> : null}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
