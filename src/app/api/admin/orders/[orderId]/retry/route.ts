import { requireAdmin } from "@/auth/actor";
import { errorResponse, json } from "@/lib/api";
import { orderIdSchema } from "@/lib/validation";
import { retryOrder } from "@/services/retry-order";

type RouteContext = { params: Promise<{ orderId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  try {
    const admin = await requireAdmin();
    const { orderId } = await context.params;

    return json({ order: await retryOrder(admin.id, orderIdSchema.parse(orderId)) });
  } catch (error) {
    return errorResponse(error);
  }
}
