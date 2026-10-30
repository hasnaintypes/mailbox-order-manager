import { ChevronRightIcon, MailIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { StatusBadge } from "@/components/orders/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { capitalize, formatDateTime, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { presentOrder } from "@/services/order-presenter";

type Order = ReturnType<typeof presentOrder>;

const PROVIDER_TILE: Record<Order["provider"], string> = {
  google: "bg-chart-4/15 text-chart-4",
  microsoft: "bg-chart-2/15 text-chart-2",
};

const head = "h-10 text-xs font-medium uppercase tracking-wide text-muted-foreground";

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
      <TableHeader className="bg-muted/40">
        <TableRow className="hover:bg-transparent">
          <TableHead className={cn(head, "pl-5")}>Order</TableHead>
          <TableHead className={head}>Status</TableHead>
          <TableHead className={cn(head, "text-right")}>Mailboxes</TableHead>
          <TableHead className={head}>Created</TableHead>
          <TableHead className={cn(head, "pr-5 text-right")}>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id} className="group h-16">
            <TableCell className="pl-5">
              <Link href={`${basePath}/${order.id}`} className="flex items-center gap-3">
                <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", PROVIDER_TILE[order.provider])}>
                  <MailIcon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium group-hover:underline">{order.domain}</span>
                  <span className="block text-xs text-muted-foreground">
                    {capitalize(order.provider)} · #{order.id.slice(0, 8)}
                  </span>
                </span>
              </Link>
            </TableCell>
            <TableCell><StatusBadge status={order.status} /></TableCell>
            <TableCell className="text-right tabular-nums">{order.mailboxCount}</TableCell>
            <TableCell>
              <span title={formatDateTime(order.createdAt)} className="text-sm">{timeAgo(order.createdAt)}</span>
              <span className="block text-xs text-muted-foreground">{formatDateTime(order.createdAt)}</span>
            </TableCell>
            <TableCell className="pr-5">
              <div className="flex items-center justify-end gap-2">
                {renderAction?.(order)}
                <Link
                  href={`${basePath}/${order.id}`}
                  aria-label={`Open ${order.domain}`}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <ChevronRightIcon className="size-4" />
                </Link>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
