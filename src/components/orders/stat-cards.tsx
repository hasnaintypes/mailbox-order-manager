import { Card, CardContent } from "@/components/ui/card";
import type { OrderStatus } from "@/domain/orders/status";
import { cn } from "@/lib/utils";

const ITEMS: { label: string; match: (s: OrderStatus) => boolean; tone: string }[] = [
  { label: "Total", match: () => true, tone: "text-foreground" },
  { label: "Active", match: (s) => s === "ACTIVE", tone: "text-success" },
  { label: "In progress", match: (s) => s === "PENDING" || s === "PROVISIONING", tone: "text-info" },
  { label: "Failed", match: (s) => s === "FAILED", tone: "text-destructive" },
];

export function StatCards({ statuses }: { statuses: OrderStatus[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {ITEMS.map((item) => (
        <Card key={item.label} size="sm">
          <CardContent className="space-y-1">
            <p className="text-sm text-muted-foreground">{item.label}</p>
            <p className={cn("text-2xl font-semibold tabular-nums", item.tone)}>
              {statuses.filter(item.match).length}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
