import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { requireAdmin } from "@/auth/actor";
import { AutoRefresh } from "@/components/layout/auto-refresh";
import { PageHeader } from "@/components/layout/page-header";
import { OrderDetailView } from "@/components/orders/order-detail-view";
import { RetryButton } from "@/components/orders/retry-button";
import { buttonVariants } from "@/components/ui/button";
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
      <PageHeader
        title={detail.order.domain}
        description="Order details and audit trail"
        actions={
          <>
            {status === "FAILED" ? <RetryButton orderId={id} size="default" /> : null}
            <Link href="/admin/orders" className={buttonVariants({ variant: "outline" })}>
              <ArrowLeftIcon /> Back
            </Link>
          </>
        }
      />
      <OrderDetailView detail={detail} />
    </>
  );
}
