import type { ReactNode } from "react";

/** Dashboard hero: greeting + context, same glow-and-grid language as the login banner. */
export function PageHero({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden rounded-2xl border bg-card">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(40rem_16rem_at_100%_0%,color-mix(in_oklch,var(--ring)_20%,transparent),transparent_65%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:36px_36px] [mask-image:linear-gradient(to_left,black,transparent_70%)]"
      />
      <div className="relative flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-ring">
            <span className="size-1.5 rounded-full bg-ring" /> {eyebrow}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          <p className="max-w-xl text-sm text-muted-foreground">{description}</p>
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}
