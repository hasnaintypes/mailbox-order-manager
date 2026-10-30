import { requireCustomer } from "@/auth/actor";
import { errorResponse, json } from "@/lib/api";
import { orderIdSchema } from "@/lib/validation";
import { getCustomerOrder } from "@/services/customer-orders";

type RouteContext = { params: Promise<{ orderId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const actor = await requireCustomer();
    const { orderId } = await context.params;

    return json(
      await getCustomerOrder(actor.id, orderIdSchema.parse(orderId)),
    );
  } catch (error) {
    return errorResponse(error);
  }
}
