import { ArrowRightIcon, CircleIcon } from "lucide-react";
import type { ReactNode } from "react";

import { StatusBadge } from "@/components/orders/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { capitalize, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { getCustomerOrder } from "@/services/customer-orders";

type Detail = Awaited<ReturnType<typeof getCustomerOrder>>;

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  );
}

export function OrderDetailView({ detail }: { detail: Detail }) {
  const { order, mailboxes, audit } = detail;
  const active = mailboxes.filter((m) => m.status === "ACTIVE").length;
  const failed = mailboxes.filter((m) => m.status === "FAILED").length;
  const percent = mailboxes.length ? Math.round((active / mailboxes.length) * 100) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Provisioning progress</CardTitle>
            <CardDescription>
              {active} of {mailboxes.length} mailboxes active{failed ? ` · ${failed} failed` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-2 overflow-hidden rounded-full bg-muted"
            >
              <div
                className={cn("h-full rounded-full bg-success transition-all", failed > 0 && "bg-destructive")}
                style={{ width: `${percent}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="gap-0 overflow-hidden pb-0">
          <CardHeader className="pb-4"><CardTitle>Mailboxes</CardTitle></CardHeader>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">#</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-4">Provider reference / failure</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mailboxes.map((mailbox) => (
                <TableRow key={mailbox.id}>
                  <TableCell className="pl-4 tabular-nums">{mailbox.ordinal}</TableCell>
                  <TableCell><StatusBadge status={mailbox.status} /></TableCell>
                  <TableCell className="pr-4 font-mono text-xs text-muted-foreground">
                    {mailbox.providerReference ?? mailbox.failureCode ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <Fact label="Status"><StatusBadge status={order.status} /></Fact>
              <Fact label="Provider">{capitalize(order.provider)}</Fact>
              <Fact label="Mailboxes">{order.mailboxCount}</Fact>
              <Fact label="Created">{formatDateTime(order.createdAt)}</Fact>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit log</CardTitle>
            <CardDescription>Every status change, in order.</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="relative space-y-5 border-l pl-5">
              {audit.map((event) => (
                <li key={event.sequence} className="relative">
                  <CircleIcon className="absolute -left-[1.65rem] top-1 size-3 fill-ring text-ring" />
                  <div className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
                    {event.toStatus ? (
                      <>
                        {event.fromStatus ? (
                          <>
                            <StatusBadge status={event.fromStatus} />
                            <ArrowRightIcon className="size-3.5 text-muted-foreground" />
                          </>
                        ) : null}
                        <StatusBadge status={event.toStatus} />
                      </>
                    ) : (
                      <Badge variant="outline">Lease reclaimed</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    #{event.sequence} · {capitalize(event.actorType)} · {formatDateTime(event.createdAt)}
                  </p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
