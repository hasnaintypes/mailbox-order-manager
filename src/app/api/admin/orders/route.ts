import { requireAdmin } from "@/auth/actor";
import { errorResponse, json } from "@/lib/api";
import { adminOrderFiltersSchema } from "@/lib/validation";
import { listAdminOrders } from "@/services/admin-orders";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const filters = adminOrderFiltersSchema.parse(
      Object.fromEntries(searchParams.entries()),
    );

    return json(await listAdminOrders(filters));
  } catch (error) {
    return errorResponse(error);
  }
}
