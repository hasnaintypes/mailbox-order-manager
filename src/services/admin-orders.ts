import { db } from "@/db/client";
import { Errors } from "@/lib/errors";
import type { AdminOrderFilters } from "@/lib/validation";
import {
  findOrderById,
  listMailboxes,
  listOrderAuditEvents,
  listOrdersForAdmin,
} from "@/repositories/order-repository";
import {
  presentAuditEvent,
  presentMailbox,
  presentOrder,
} from "./order-presenter";

export async function listAdminOrders(filters: AdminOrderFilters) {
  const { items, total } = await listOrdersForAdmin(filters);

  return {
    items: items.map(presentOrder),
    page: filters.page,
    pageSize: filters.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
  };
}

export async function getAdminOrder(orderId: string) {
  const order = await findOrderById(db, orderId);

  if (!order) {
    throw Errors.notFound("Order");
  }

  const [mailboxes, audit] = await Promise.all([
    listMailboxes(order.id),
    listOrderAuditEvents(order.id),
  ]);

  return {
    order: presentOrder(order),
    mailboxes: mailboxes.map(presentMailbox),
    audit: audit.map(presentAuditEvent),
  };
}
