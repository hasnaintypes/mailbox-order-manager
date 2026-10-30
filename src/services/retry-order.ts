import { and, eq, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { mailboxes, orders } from "@/db/schema";
import { assertTransition } from "@/domain/orders/state-machine";
import { InvalidTransitionError } from "@/domain/orders/errors";
import { Errors } from "@/lib/errors";
import { appendAuditEvent } from "@/repositories/audit-repository";
import { findOrderById } from "@/repositories/order-repository";
import { presentOrder } from "./order-presenter";

/**
 * Admin retry: FAILED -> PENDING. Successful mailboxes are kept; failed ones get a
 * fresh attempt key so the provider treats them as a new operation.
 */
export async function retryOrder(adminId: string, orderId: string) {
  return db.transaction(async (tx) => {
    const [current] = await tx
      .select({ status: orders.status })
      .from(orders)
      .where(eq(orders.id, orderId))
      .for("update");

    if (!current) {
      throw Errors.notFound("Order");
    }

    try {
      assertTransition(current.status, "PENDING");
    } catch (error) {
      if (error instanceof InvalidTransitionError) {
        throw Errors.invalidTransition(error.from, error.to);
      }
      throw error;
    }

    await tx
      .update(orders)
      .set({
        status: "PENDING",
        claimToken: null,
        claimExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    await tx
      .update(mailboxes)
      .set({
        status: "PENDING",
        provisionAttempt: sql`${mailboxes.provisionAttempt} + 1`,
        provisioningKey: sql`gen_random_uuid()`,
        failureCode: null,
        updatedAt: new Date(),
      })
      .where(and(eq(mailboxes.orderId, orderId), eq(mailboxes.status, "FAILED")));

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
