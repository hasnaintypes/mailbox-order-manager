import { redirect } from "next/navigation";

import { requireCustomer } from "@/auth/actor";
import { PageHeader } from "@/components/layout/page-header";
import { CreateOrderForm } from "@/components/orders/create-order-form";

export default async function NewOrderPage() {
  await requireCustomer().catch(() => redirect("/"));

  return (
    <>
      <PageHeader title="New order" description="Order pre-warmed mailboxes for a domain." />
      <CreateOrderForm />
    </>
  );
}
