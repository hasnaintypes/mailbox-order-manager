import { db } from "@/db/client";
import { InvalidTransitionError } from "@/domain/orders/errors";
import { assertTransition } from "@/domain/orders/state-machine";
import { Errors } from "@/lib/errors";
import { appendAuditEvent } from "@/repositories/audit-repository";
import {
  findOrderById,
  lockOrderStatus,
  requeueFailedOrder,
} from "@/repositories/order-repository";
import { presentOrder } from "./order-presenter";

/**
 * Admin retry: FAILED -> PENDING. Successful mailboxes are kept; failed ones get a
 * fresh attempt key so the provider treats them as a new operation.
 */
export async function retryOrder(adminId: string, orderId: string) {
  return db.transaction(async (tx) => {
    const status = await lockOrderStatus(tx, orderId);

    if (!status) {
      throw Errors.notFound("Order");
    }

    try {
      assertTransition(status, "PENDING");
    } catch (error) {
      if (error instanceof InvalidTransitionError) {
        throw Errors.invalidTransition(error.from, error.to);
      }
      throw error;
    }

    await requeueFailedOrder(tx, orderId);

    await appendAuditEvent(tx, {
      orderId,
      fromStatus: "FAILED",
      toStatus: "PENDING",
      actorType: "admin",
      actorUserId: adminId,
    });

    const updated = await findOrderById(tx, orderId);

    if (!updated) {
      throw Errors.notFound("Order");
    }

    return presentOrder(updated);
  });
}
