import type { Mailbox, Order, OrderAuditLog } from "@/db/schema";

export function presentOrder(order: Order) {
  return {
    id: order.id,
    domain: order.domain,
    provider: order.provider,
    mailboxCount: order.mailboxCount,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

export function presentMailbox(mailbox: Mailbox) {
  return {
    id: mailbox.id,
    ordinal: mailbox.ordinal,
    status: mailbox.status,
    providerReference: mailbox.providerReference,
    failureCode: mailbox.failureCode,
    updatedAt: mailbox.updatedAt,
  };
}

export function presentAuditEvent(event: OrderAuditLog) {
  return {
    sequence: event.sequence,
    eventType: event.eventType,
    fromStatus: event.fromStatus,
    toStatus: event.toStatus,
    actorType: event.actorType,
    createdAt: event.createdAt,
  };
}
