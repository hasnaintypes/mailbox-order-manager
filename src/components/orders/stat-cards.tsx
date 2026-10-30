import { CircleCheckIcon, CircleXIcon, Loader2Icon, PackageIcon, type LucideIcon } from "lucide-react";

import type { OrderStatus } from "@/domain/orders/status";
import { cn } from "@/lib/utils";

const ITEMS: {
  label: string;
  hint: string;
  match: (s: OrderStatus) => boolean;
  icon: LucideIcon;
  tile: string;
}[] = [
  { label: "Total orders", hint: "All time", match: () => true, icon: PackageIcon, tile: "bg-muted text-foreground" },
  { label: "Active", hint: "Fully provisioned", match: (s) => s === "ACTIVE", icon: CircleCheckIcon, tile: "bg-success/15 text-success" },
  { label: "In progress", hint: "Pending or provisioning", match: (s) => s === "PENDING" || s === "PROVISIONING", icon: Loader2Icon, tile: "bg-info/15 text-info" },
  { label: "Failed", hint: "Needs attention", match: (s) => s === "FAILED", icon: CircleXIcon, tile: "bg-destructive/15 text-destructive" },
];

export function StatCards({ statuses }: { statuses: OrderStatus[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="flex items-center gap-4 rounded-xl border bg-card p-4">
            <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-lg", item.tile)}>
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-2xl leading-none font-semibold tabular-nums">{statuses.filter(item.match).length}</p>
              <p className="mt-1 truncate text-sm font-medium">{item.label}</p>
              <p className="truncate text-xs text-muted-foreground">{item.hint}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
