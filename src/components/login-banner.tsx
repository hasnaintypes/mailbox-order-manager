import {
  CheckCircle2Icon,
  InboxIcon,
  Loader2Icon,
  ShieldCheckIcon,
  XCircleIcon,
  ZapIcon,
} from "lucide-react"

const MAILBOXES = [
  { n: 1, ref: "google-8f3a…c21", state: "active" },
  { n: 2, ref: "google-1b7e…94d", state: "active" },
  { n: 3, ref: "provisioning…", state: "running" },
] as const

const AUDIT = [
  { from: "Pending", to: "Provisioning", by: "Worker" },
  { from: "Provisioning", to: "Active", by: "Worker" },
]

export function LoginBanner() {
  return (
    <aside className="relative hidden overflow-hidden border-l bg-sidebar lg:block">
      {/* background: soft glow + faint grid */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(60rem_40rem_at_90%_0%,color-mix(in_oklch,var(--ring)_22%,transparent),transparent_60%),radial-gradient(40rem_30rem_at_0%_100%,color-mix(in_oklch,var(--ring)_12%,transparent),transparent_60%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />

      <div className="relative flex h-full flex-col items-start justify-between p-12 text-left">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <InboxIcon className="size-4" />
          </span>
          Mailbox Orders
        </div>

        <div className="w-full max-w-md space-y-8">
          <div className="space-y-4">
            <span className="flex w-fit items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <span className="size-1.5 rounded-full bg-ring" /> Live provisioning
            </span>
            <h2 className="text-4xl leading-[1.1] font-semibold tracking-tight text-balance">
              Pre-warmed mailboxes,
              <br />
              <span className="text-ring">ordered and tracked</span> in one place.
            </h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Place an order, watch each mailbox come online, and keep a full audit trail of every
              status change.
            </p>
          </div>

          {/* product preview */}
          <div className="relative">
            <div className="rounded-xl border bg-card/80 p-4 text-left shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">acme-outreach.com</p>
                  <p className="text-xs text-muted-foreground">Google Workspace · 3 mailboxes</p>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-info/15 px-2 py-0.5 text-xs font-medium text-info">
                  <Loader2Icon className="size-3 animate-spin" /> Provisioning
                </span>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-2/3 rounded-full bg-ring" />
              </div>

              <ul className="mt-3 space-y-1.5">
                {MAILBOXES.map((m) => (
                  <li key={m.n} className="flex items-center justify-between rounded-md bg-muted/50 px-2.5 py-1.5 text-xs">
                    <span className="flex items-center gap-2">
                      {m.state === "active" ? (
                        <CheckCircle2Icon className="size-3.5 text-success" />
                      ) : (
                        <Loader2Icon className="size-3.5 animate-spin text-info" />
                      )}
                      Mailbox {m.n}
                    </span>
                    <span className="font-mono text-muted-foreground">{m.ref}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* floating audit card */}
            <div className="absolute -bottom-10 -right-8 w-56 rounded-xl border bg-card/90 p-3 text-left shadow-xl backdrop-blur">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium">
                <ShieldCheckIcon className="size-3.5 text-ring" /> Audit log
              </p>
              <ol className="space-y-1.5 border-l pl-3">
                {AUDIT.map((e) => (
                  <li key={e.to} className="text-[11px] leading-tight text-muted-foreground">
                    <span className="text-foreground">{e.from}</span> → <span className="text-foreground">{e.to}</span>
                    <span className="block">{e.by}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* floating failure chip */}
            <div className="absolute -top-4 -left-4 flex items-center gap-1.5 rounded-full border bg-card/90 px-3 py-1.5 text-xs shadow-lg backdrop-blur">
              <XCircleIcon className="size-3.5 text-destructive" /> Failed? One-click retry
            </div>
          </div>
        </div>

        <ul className="flex items-center gap-6 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <ZapIcon className="size-3.5 text-ring" /> Google & Microsoft
          </li>
          <li className="flex items-center gap-1.5">
            <ShieldCheckIcon className="size-3.5 text-ring" /> Idempotent orders
          </li>
        </ul>
      </div>
    </aside>
  )
}
