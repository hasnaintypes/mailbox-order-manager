import { createHash } from "node:crypto";

import { db } from "@/db/client";
import { idempotencyRecords, mailboxes, orders } from "@/db/schema";
import { Errors } from "@/lib/errors";
import type { CreateOrderInput } from "@/lib/validation";
import { appendAuditEvent } from "@/repositories/audit-repository";
import {
  findIdempotencyRecord,
  findOrderById,
} from "@/repositories/order-repository";
import { presentOrder } from "./order-presenter";

type CreateOrderCommand = {
  customerId: string;
  input: CreateOrderInput;
  idempotencyKey: string;
};

export type CreateOrderResult = {
  order: ReturnType<typeof presentOrder>;
  idempotentReplay: boolean;
};

function fingerprintRequest(customerId: string, input: CreateOrderInput): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        customerId,
        domain: input.domain,
        provider: input.provider,
        mailboxCount: input.mailboxCount,
      }),
    )
    .digest("hex");
}

function isUniqueConstraint(error: unknown, constraint: string): boolean {
  // Drizzle wraps driver errors, so walk the cause chain to the Postgres error.
  for (let current = error; current && typeof current === "object"; ) {
    const candidate = current as {
      code?: string;
      constraint_name?: string;
      cause?: unknown;
    };

    if (
      candidate.code === "23505" &&
      candidate.constraint_name === constraint
    ) {
      return true;
    }

    current = candidate.cause;
  }

  return false;
}

async function replayExistingOrder(
  customerId: string,
  idempotencyKey: string,
  requestFingerprint: string,
): Promise<CreateOrderResult | null> {
  const record = await findIdempotencyRecord(db, customerId, idempotencyKey);

  if (!record) {
    return null;
  }

  if (record.requestFingerprint !== requestFingerprint) {
    throw Errors.idempotencyConflict();
  }

  const order = await findOrderById(db, record.orderId);

  if (!order) {
    throw Errors.notFound("Order");
  }

  return { order: presentOrder(order), idempotentReplay: true };
}

export async function createOrder(
  command: CreateOrderCommand,
): Promise<CreateOrderResult> {
  const requestFingerprint = fingerprintRequest(command.customerId, command.input);
  const replay = await replayExistingOrder(
    command.customerId,
    command.idempotencyKey,
    requestFingerprint,
  );

  if (replay) {
    return replay;
  }

  try {
    return await db.transaction(async (transaction) => {
      const [order] = await transaction
        .insert(orders)
        .values({
          customerId: command.customerId,
          domain: command.input.domain,
          provider: command.input.provider,
          mailboxCount: command.input.mailboxCount,
        })
        .returning();

      if (!order) {
        throw new Error("Order insertion returned no row.");
      }

      await transaction.insert(mailboxes).values(
        Array.from({ length: command.input.mailboxCount }, (_, index) => ({
          orderId: order.id,
          ordinal: index + 1,
        })),
      );

      await appendAuditEvent(transaction, {
        orderId: order.id,
        fromStatus: undefined,
        toStatus: "PENDING",
        actorType: "customer",
        actorUserId: command.customerId,
      });

      await transaction.insert(idempotencyRecords).values({
        customerId: command.customerId,
        idempotencyKey: command.idempotencyKey,
        requestFingerprint,
        orderId: order.id,
      });

      const createdOrder = await findOrderById(transaction, order.id);

      if (!createdOrder) {
        throw new Error("Created order could not be reloaded.");
      }

      return { order: presentOrder(createdOrder), idempotentReplay: false };
    });
  } catch (error) {
    if (
      !isUniqueConstraint(
        error,
        "idempotency_records_customer_key_unique",
      )
    ) {
      throw error;
    }

    const concurrentReplay = await replayExistingOrder(
      command.customerId,
      command.idempotencyKey,
      requestFingerprint,
    );

    if (!concurrentReplay) {
      throw error;
    }

    return concurrentReplay;
  }
}
