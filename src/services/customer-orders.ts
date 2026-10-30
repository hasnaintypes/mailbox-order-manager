import { Errors } from "@/lib/errors";
import {
  findOrderForCustomer,
  listMailboxes,
  listOrderAuditEvents,
  listOrdersForCustomer,
} from "@/repositories/order-repository";
import {
  presentAuditEvent,
  presentMailbox,
  presentOrder,
} from "./order-presenter";

export async function listCustomerOrders(
  customerId: string,
  page: number,
  pageSize: number,
) {
  const orders = await listOrdersForCustomer(customerId, page, pageSize);

  return {
    items: orders.map(presentOrder),
    page,
    pageSize,
  };
}

export async function getCustomerOrder(customerId: string, orderId: string) {
  const order = await findOrderForCustomer(customerId, orderId);

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
