import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/domain/orders/status";

const VARIANTS: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  PROVISIONING: "secondary",
  ACTIVE: "default",
  FAILED: "destructive",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={VARIANTS[status]}>{status}</Badge>;
}
