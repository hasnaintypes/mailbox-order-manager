import type { ReactNode } from "react";

import { StatusBadge } from "@/components/orders/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { getCustomerOrder } from "@/services/customer-orders";

type Detail = Awaited<ReturnType<typeof getCustomerOrder>>;

const formatDate = (value: Date) => value.toISOString().replace("T", " ").slice(0, 19) + " UTC";

export function OrderDetailView({ detail, actions }: { detail: Detail; actions?: ReactNode }) {
  const { order, mailboxes, audit } = detail;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>{order.domain}</CardTitle>
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} />
            {actions}
          </div>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-3">
          <p>Provider: <span className="font-medium capitalize">{order.provider}</span></p>
          <p>Mailboxes: <span className="font-medium">{order.mailboxCount}</span></p>
          <p>Created: <span className="font-medium">{formatDate(order.createdAt)}</span></p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Mailboxes</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reference / failure</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mailboxes.map((mailbox) => (
                <TableRow key={mailbox.id}>
                  <TableCell>{mailbox.ordinal}</TableCell>
                  <TableCell><StatusBadge status={mailbox.status} /></TableCell>
                  <TableCell className="font-mono text-xs">
                    {mailbox.providerReference ?? mailbox.failureCode ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Audit log</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Transition</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audit.map((event) => (
                <TableRow key={event.sequence}>
                  <TableCell>{event.sequence}</TableCell>
                  <TableCell>{event.eventType}</TableCell>
                  <TableCell>
                    {event.toStatus ? `${event.fromStatus ?? "—"} → ${event.toStatus}` : "—"}
                  </TableCell>
                  <TableCell className="capitalize">{event.actorType}</TableCell>
                  <TableCell className="text-xs">{formatDate(event.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
