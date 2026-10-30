import { notFound, redirect } from "next/navigation";

import { requireCustomer } from "@/auth/actor";
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

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Order detail</h1>
      <OrderDetailView detail={detail} />
    </div>
  );
}
