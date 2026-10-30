import { redirect } from "next/navigation";

import { requireCustomer } from "@/auth/actor";
import { CreateOrderForm } from "@/components/orders/create-order-form";

export default async function NewOrderPage() {
  await requireCustomer().catch(() => redirect("/"));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">New order</h1>
      <CreateOrderForm />
    </div>
  );
}
