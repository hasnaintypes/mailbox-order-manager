import { notFound, redirect } from "next/navigation";

import { requireAdmin } from "@/auth/actor";
import { OrderDetailView } from "@/components/orders/order-detail-view";
import { RetryButton } from "@/components/orders/retry-button";
import { AppError } from "@/lib/errors";
import { orderIdSchema } from "@/lib/validation";
import { getAdminOrder } from "@/services/admin-orders";

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  await requireAdmin().catch(() => redirect("/"));
  const parsed = orderIdSchema.safeParse((await params).orderId);

  if (!parsed.success) {
    notFound();
  }

  const detail = await getAdminOrder(parsed.data).catch((error) => {
    if (error instanceof AppError && error.status === 404) {
      notFound();
    }
    throw error;
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Order detail</h1>
      <OrderDetailView
        detail={detail}
        actions={detail.order.status === "FAILED" ? <RetryButton orderId={detail.order.id} /> : undefined}
      />
    </div>
  );
}
