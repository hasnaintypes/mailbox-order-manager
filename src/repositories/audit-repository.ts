import { eq, sql } from "drizzle-orm";

import { orderAuditLogs, orders } from "@/db/schema";
import type { DbExecutor } from "@/db/types";
import { Errors } from "@/lib/errors";

type AuditEventInput = {
  orderId: string;
  eventType?: "TRANSITION" | "LEASE_RECLAIMED";
  fromStatus?: "PENDING" | "PROVISIONING" | "ACTIVE" | "FAILED";
  toStatus?: "PENDING" | "PROVISIONING" | "ACTIVE" | "FAILED";
  actorType: "customer" | "admin" | "worker";
  actorUserId?: string;
  claimToken?: string;
  claimGeneration?: number;
};

export async function appendAuditEvent(
  executor: DbExecutor,
  input: AuditEventInput,
): Promise<number> {
  const [updatedOrder] = await executor
    .update(orders)
    .set({
      auditSequence: sql`${orders.auditSequence} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, input.orderId))
    .returning({ auditSequence: orders.auditSequence });

  if (!updatedOrder) {
    throw Errors.notFound("Order");
  }

  await executor.insert(orderAuditLogs).values({
    orderId: input.orderId,
    sequence: updatedOrder.auditSequence,
    eventType: input.eventType ?? "TRANSITION",
    fromStatus: input.fromStatus,
    toStatus: input.toStatus,
    actorType: input.actorType,
    actorUserId: input.actorUserId,
    claimToken: input.claimToken,
    claimGeneration: input.claimGeneration,
  });

  return updatedOrder.auditSequence;
}
