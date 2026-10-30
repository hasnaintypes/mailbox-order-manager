import { requireCustomer } from "@/auth/actor";
import { errorResponse, json } from "@/lib/api";
import {
  createOrderSchema,
  idempotencyKeySchema,
  paginationSchema,
} from "@/lib/validation";
import { createOrder } from "@/services/create-order";
import { listCustomerOrders } from "@/services/customer-orders";

export async function POST(request: Request) {
  try {
    const actor = await requireCustomer();
    const input = createOrderSchema.parse(await request.json());
    const idempotencyKey = idempotencyKeySchema.parse(
      request.headers.get("Idempotency-Key"),
    );
    const result = await createOrder({
      customerId: actor.id,
      input,
      idempotencyKey,
    });

    return json(result, result.idempotentReplay ? 200 : 201);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function GET(request: Request) {
  try {
    const actor = await requireCustomer();
    const { searchParams } = new URL(request.url);
    const pagination = paginationSchema.parse({
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
    });

    return json(
      await listCustomerOrders(actor.id, pagination.page, pagination.pageSize),
    );
  } catch (error) {
    return errorResponse(error);
  }
}
