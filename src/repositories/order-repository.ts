import { and, asc, desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import {
  idempotencyRecords,
  mailboxes,
  orderAuditLogs,
  orders,
} from "@/db/schema";
import type { DbExecutor } from "@/db/types";

export function findIdempotencyRecord(
  executor: DbExecutor,
  customerId: string,
  idempotencyKey: string,
) {
  return executor.query.idempotencyRecords.findFirst({
    where: and(
      eq(idempotencyRecords.customerId, customerId),
      eq(idempotencyRecords.idempotencyKey, idempotencyKey),
    ),
  });
}

export function findOrderById(executor: DbExecutor, orderId: string) {
  return executor.query.orders.findFirst({ where: eq(orders.id, orderId) });
}

export function findOrderForCustomer(customerId: string, orderId: string) {
  return db.query.orders.findFirst({
    where: and(eq(orders.id, orderId), eq(orders.customerId, customerId)),
  });
}

export function listOrdersForCustomer(
  customerId: string,
  page: number,
  pageSize: number,
) {
  return db
    .select()
    .from(orders)
    .where(eq(orders.customerId, customerId))
    .orderBy(desc(orders.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
}

export function listMailboxes(orderId: string) {
  return db
    .select()
    .from(mailboxes)
    .where(eq(mailboxes.orderId, orderId))
    .orderBy(asc(mailboxes.ordinal));
}

export function listOrderAuditEvents(orderId: string) {
  return db
    .select()
    .from(orderAuditLogs)
    .where(eq(orderAuditLogs.orderId, orderId))
    .orderBy(asc(orderAuditLogs.sequence));
}
