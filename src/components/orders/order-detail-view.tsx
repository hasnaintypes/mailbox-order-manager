import {
  ArrowLeftIcon,
  CheckIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  CircleXIcon,
  Loader2Icon,
  MailIcon,
  ShieldCheckIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { StatusBadge } from "@/components/orders/status-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MailboxStatus, OrderStatus } from "@/domain/orders/status";
import { capitalize, formatDateTime, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { getCustomerOrder } from "@/services/customer-orders";

type Detail = Awaited<ReturnType<typeof getCustomerOrder>>;
type AuditEvent = Detail["audit"][number];

const STATUS_ICON: Record<MailboxStatus, { icon: LucideIcon; className: string }> = {
  PENDING: { icon: CircleDashedIcon, className: "text-muted-foreground" },
  PROVISIONING: { icon: Loader2Icon, className: "animate-spin text-info" },
  ACTIVE: { icon: CircleCheckIcon, className: "text-success" },
  FAILED: { icon: CircleXIcon, className: "text-destructive" },
};

const PROVIDER_TILE = {
  google: "bg-chart-4/15 text-chart-4",
  microsoft: "bg-chart-2/15 text-chart-2",
} as const;

function describeEvent(event: AuditEvent): { title: string; tone: string } {
  if (event.eventType === "LEASE_RECLAIMED") {
    return { title: "Stalled worker replaced — provisioning resumed", tone: "bg-info" };
  }
  if (!event.fromStatus) return { title: "Order created", tone: "bg-ring" };
  if (event.toStatus === "PROVISIONING") return { title: "Worker started provisioning", tone: "bg-info" };
  if (event.toStatus === "ACTIVE") return { title: "All mailboxes active", tone: "bg-success" };
  if (event.toStatus === "FAILED") return { title: "Provisioning failed", tone: "bg-destructive" };
  if (event.fromStatus === "FAILED" && event.toStatus === "PENDING") {
    return { title: "Retry requested — back in the queue", tone: "bg-ring" };
  }
  return { title: `${capitalize(event.fromStatus.toLowerCase())} → ${capitalize((event.toStatus ?? "").toLowerCase())}`, tone: "bg-muted-foreground" };
}

function Lifecycle({ status }: { status: OrderStatus }) {
  const failed = status === "FAILED";
  const current = status === "PENDING" ? 0 : status === "PROVISIONING" ? 1 : 2;
  const steps = [
    { label: "Pending", hint: "Queued" },
    { label: "Provisioning", hint: "Worker running" },
    failed ? { label: "Failed", hint: "Needs retry" } : { label: "Active", hint: "Ready" },
  ];

  return (
    <ol className="grid grid-cols-3 gap-2">
      {steps.map((step, index) => {
        const done = index < current || (index === current && status === "ACTIVE");
        const isCurrent = index === current && !done;
        const bad = failed && index === 2;

        return (
          <li key={step.label} className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                  done && "border-success bg-success/15 text-success",
                  isCurrent && !bad && "border-info bg-info/15 text-info",
                  bad && "border-destructive bg-destructive/15 text-destructive",
                )}
              >
                {bad ? <CircleXIcon className="size-4" /> : done ? <CheckIcon className="size-4" /> : isCurrent ? <Loader2Icon className="size-4 animate-spin" /> : index + 1}
              </span>
              <span className={cn("h-px flex-1 bg-border", done && "bg-success/50", index === steps.length - 1 && "hidden")} />
            </div>
            <div>
              <p className="text-sm font-medium">{step.label}</p>
              <p className="text-xs text-muted-foreground">{step.hint}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}

export function OrderDetailView({
  detail,
  backHref,
  backLabel,
  actions,
}: {
  detail: Detail;
  backHref: string;
  backLabel: string;
  actions?: ReactNode;
}) {
  const { order, mailboxes, audit } = detail;
  const count = (status: MailboxStatus) => mailboxes.filter((m) => m.status === status).length;
  const active = count("ACTIVE");
  const failed = count("FAILED");
  const inProgress = count("PENDING") + count("PROVISIONING");
  const percent = mailboxes.length ? Math.round((active / mailboxes.length) * 100) : 0;
  const latest = [...audit].reverse();

  const tiles = [
    { label: "Mailboxes", value: mailboxes.length, tone: "bg-muted text-foreground", icon: MailIcon },
    { label: "Active", value: active, tone: "bg-success/15 text-success", icon: CircleCheckIcon },
    { label: "In progress", value: inProgress, tone: "bg-info/15 text-info", icon: Loader2Icon },
    { label: "Failed", value: failed, tone: "bg-destructive/15 text-destructive", icon: CircleXIcon },
  ];

  return (
    <div className="space-y-6">
      <Link href={backHref} className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2")}>
        <ArrowLeftIcon /> {backLabel}
      </Link>

      <section className="relative overflow-hidden rounded-2xl border bg-card">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(40rem_16rem_at_100%_0%,color-mix(in_oklch,var(--ring)_18%,transparent),transparent_65%)]"
        />
        <div className="relative flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <span className={cn("flex size-14 shrink-0 items-center justify-center rounded-2xl", PROVIDER_TILE[order.provider])}>
              <MailIcon className="size-6" />
            </span>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{order.domain}</h1>
                <StatusBadge status={order.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                {capitalize(order.provider)} · {order.mailboxCount} {order.mailboxCount === 1 ? "mailbox" : "mailboxes"} ·
                created {timeAgo(order.createdAt)} · #{order.id.slice(0, 8)}
              </p>
            </div>
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </div>
      </section>

      {order.status === "FAILED" ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Provisioning failed</AlertTitle>
          <AlertDescription>
            {failed} of {mailboxes.length} mailboxes failed. Successful mailboxes are kept — a retry only re-runs the failed ones.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {tiles.map(({ label, value, tone, icon: Icon }) => (
          <div key={label} className="flex items-center gap-4 rounded-xl border bg-card p-4">
            <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-lg", tone)}>
              <Icon className="size-5" />
            </span>
            <div>
              <p className="text-2xl leading-none font-semibold tabular-nums">{value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
              <CardDescription>{active} of {mailboxes.length} mailboxes active · {percent}%</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
              <Lifecycle status={order.status} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mailboxes</CardTitle>
              <CardDescription>Provider reference or failure code for each mailbox</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                {mailboxes.map((mailbox) => {
                  const { icon: Icon, className } = STATUS_ICON[mailbox.status];
                  return (
                    <li key={mailbox.id} className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                      <Icon className={cn("size-5 shrink-0", className)} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">Mailbox {mailbox.ordinal}</p>
                        <p
                          className={cn(
                            "truncate font-mono text-xs",
                            mailbox.failureCode ? "text-destructive" : "text-muted-foreground",
                          )}
                          title={mailbox.providerReference ?? mailbox.failureCode ?? undefined}
                        >
                          {mailbox.providerReference ?? mailbox.failureCode ?? capitalize(mailbox.status.toLowerCase())}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Order details</CardTitle></CardHeader>
            <CardContent>
              <dl className="divide-y">
                <Fact label="Domain">{order.domain}</Fact>
                <Fact label="Provider">{capitalize(order.provider)}</Fact>
                <Fact label="Mailboxes">{order.mailboxCount}</Fact>
                <Fact label="Created">{formatDateTime(order.createdAt)}</Fact>
                <Fact label="Updated">{formatDateTime(order.updatedAt)}</Fact>
                <Fact label="Order ID"><span className="break-all font-mono text-xs">{order.id}</span></Fact>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldCheckIcon className="size-4 text-ring" /> Audit log</CardTitle>
              <CardDescription>Every status change, newest first</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="relative space-y-6 border-l pl-6">
                {latest.map((event) => {
                  const { title, tone } = describeEvent(event);
                  return (
                    <li key={event.sequence} className="relative">
                      <span className={cn("absolute top-1 -left-[1.9rem] size-3 rounded-full ring-4 ring-card", tone)} />
                      <p className="text-sm font-medium">{title}</p>
                      {event.toStatus ? (
                        <p className="mt-1 flex flex-wrap items-center gap-1.5">
                          {event.fromStatus ? <StatusBadge status={event.fromStatus} /> : null}
                          {event.fromStatus ? <span className="text-xs text-muted-foreground">→</span> : null}
                          <StatusBadge status={event.toStatus} />
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-muted-foreground">
                        #{event.sequence} · {capitalize(event.actorType)} · {formatDateTime(event.createdAt)}
                      </p>
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
