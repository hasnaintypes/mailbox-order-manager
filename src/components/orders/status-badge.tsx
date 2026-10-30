import {
  CircleCheckIcon,
  CircleDashedIcon,
  CircleXIcon,
  Loader2Icon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/domain/orders/status";
import { cn } from "@/lib/utils";

const STYLES: Record<OrderStatus, { label: string; className: string; icon: typeof CircleCheckIcon }> = {
  PENDING: { label: "Pending", className: "bg-muted text-muted-foreground", icon: CircleDashedIcon },
  PROVISIONING: { label: "Provisioning", className: "bg-info/15 text-info", icon: Loader2Icon },
  ACTIVE: { label: "Active", className: "bg-success/15 text-success", icon: CircleCheckIcon },
  FAILED: { label: "Failed", className: "bg-destructive/10 text-destructive", icon: CircleXIcon },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, className, icon: Icon } = STYLES[status];

  return (
    <Badge variant="secondary" className={cn("gap-1 font-medium", className)}>
      <Icon className={cn("size-3", status === "PROVISIONING" && "animate-spin")} />
      {label}
    </Badge>
  );
}
