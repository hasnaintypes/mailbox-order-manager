import { requireAdmin } from "@/auth/actor";
import { errorResponse, json } from "@/lib/api";
import { orderIdSchema } from "@/lib/validation";
import { getAdminOrder } from "@/services/admin-orders";

type RouteContext = { params: Promise<{ orderId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdmin();
    const { orderId } = await context.params;

    return json(await getAdminOrder(orderIdSchema.parse(orderId)));
  } catch (error) {
    return errorResponse(error);
  }
}
