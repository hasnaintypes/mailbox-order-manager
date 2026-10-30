import { and, asc, count, desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import {
  idempotencyRecords,
  mailboxes,
  orderAuditLogs,
  orders,
} from "@/db/schema";
import type { DbExecutor } from "@/db/types";
import type { OrderStatus, ProviderName } from "@/domain/orders/status";

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

export async function listOrdersForAdmin(filters: {
  status?: OrderStatus;
  provider?: ProviderName;
  page: number;
  pageSize: number;
}) {
  const where = and(
    filters.status ? eq(orders.status, filters.status) : undefined,
    filters.provider ? eq(orders.provider, filters.provider) : undefined,
  );

  const [items, [counted]] = await Promise.all([
    db
      .select()
      .from(orders)
      .where(where)
      .orderBy(desc(orders.createdAt), desc(orders.id))
      .limit(filters.pageSize)
      .offset((filters.page - 1) * filters.pageSize),
    db.select({ total: count() }).from(orders).where(where),
  ]);

  return { items, total: counted?.total ?? 0 };
}

export async function countOrdersByStatus() {
  const rows = await db
    .select({ status: orders.status, total: count() })
    .from(orders)
    .groupBy(orders.status);

  return rows.flatMap((row) => Array<OrderStatus>(row.total).fill(row.status));
}
