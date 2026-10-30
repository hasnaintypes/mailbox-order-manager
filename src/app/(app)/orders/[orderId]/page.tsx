import { notFound, redirect } from "next/navigation";

import { requireCustomer } from "@/auth/actor";
import { AutoRefresh } from "@/components/layout/auto-refresh";
import { OrderDetailView } from "@/components/orders/order-detail-view";
import { AppError } from "@/lib/errors";
import { orderIdSchema } from "@/lib/validation";
import { getCustomerOrder } from "@/services/customer-orders";

export default async function CustomerOrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const actor = await requireCustomer().catch(() => redirect("/"));
  const parsed = orderIdSchema.safeParse((await params).orderId);

  if (!parsed.success) {
    notFound();
  }

  const detail = await getCustomerOrder(actor.id, parsed.data).catch((error) => {
    if (error instanceof AppError && error.status === 404) {
      notFound();
    }
    throw error;
  });
  const { status } = detail.order;

  return (
    <>
      <AutoRefresh active={status === "PENDING" || status === "PROVISIONING"} />
      <OrderDetailView detail={detail} backHref="/orders" backLabel="Back to my orders" />
    </>
  );
}
