import { notFound, redirect } from "next/navigation";

import { requireAdmin } from "@/auth/actor";
import { AutoRefresh } from "@/components/layout/auto-refresh";
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
  const { status, id } = detail.order;

  return (
    <>
      <AutoRefresh active={status === "PENDING" || status === "PROVISIONING"} />
      <OrderDetailView
        detail={detail}
        backHref="/admin/orders"
        backLabel="Back to all orders"
        actions={status === "FAILED" ? <RetryButton orderId={id} size="default" /> : undefined}
      />
    </>
  );
}
