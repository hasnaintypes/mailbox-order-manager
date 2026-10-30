import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { requireCustomer } from "@/auth/actor";
import { AutoRefresh } from "@/components/layout/auto-refresh";
import { PageHeader } from "@/components/layout/page-header";
import { OrderDetailView } from "@/components/orders/order-detail-view";
import { buttonVariants } from "@/components/ui/button";
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
  const inFlight = detail.order.status === "PENDING" || detail.order.status === "PROVISIONING";

  return (
    <>
      <AutoRefresh active={inFlight} />
      <PageHeader
        title={detail.order.domain}
        description="Order details"
        actions={
          <Link href="/orders" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeftIcon /> Back
          </Link>
        }
      />
      <OrderDetailView detail={detail} />
    </>
  );
}
