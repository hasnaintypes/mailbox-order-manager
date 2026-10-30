import { eq } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { db, sqlClient } from "@/db/client";
import {
  idempotencyRecords,
  mailboxes,
  orderAuditLogs,
  orders,
  users,
} from "@/db/schema";
import { createOrder } from "@/services/create-order";

const input = { domain: "acme.com", provider: "google" as const, mailboxCount: 3 };

let customerId: string;

beforeEach(async () => {
  await db.delete(idempotencyRecords);
  await db.delete(orders);
  await db.delete(users);
  const [user] = await db
    .insert(users)
    .values({ email: "c@test.dev", passwordHash: "x", role: "customer" })
    .returning();
  customerId = user!.id;
});

afterAll(async () => {
  await sqlClient.end();
});

describe("createOrder", () => {
  it("persists a PENDING order with mailboxes and a creation audit event", async () => {
    const { order, idempotentReplay } = await createOrder({
      customerId,
      input,
      idempotencyKey: "key-12345678",
    });

    expect(idempotentReplay).toBe(false);
    expect(order).toMatchObject({ status: "PENDING", domain: "acme.com", mailboxCount: 3 });

    const rows = await db.select().from(mailboxes).where(eq(mailboxes.orderId, order.id));
    expect(rows.map((m) => m.ordinal).sort()).toEqual([1, 2, 3]);

    const audit = await db.select().from(orderAuditLogs).where(eq(orderAuditLogs.orderId, order.id));
    expect(audit).toHaveLength(1);
    expect(audit[0]).toMatchObject({ sequence: 1, fromStatus: null, toStatus: "PENDING" });
  });

  it("replays the same key and payload without creating a second order", async () => {
    const first = await createOrder({ customerId, input, idempotencyKey: "key-12345678" });
    const second = await createOrder({ customerId, input, idempotencyKey: "key-12345678" });

    expect(second.idempotentReplay).toBe(true);
    expect(second.order.id).toBe(first.order.id);
    expect(await db.select().from(orders)).toHaveLength(1);
  });

  it("rejects the same key with a different payload", async () => {
    await createOrder({ customerId, input, idempotencyKey: "key-12345678" });

    await expect(
      createOrder({
        customerId,
        input: { ...input, mailboxCount: 4 },
        idempotencyKey: "key-12345678",
      }),
    ).rejects.toMatchObject({ code: "IDEMPOTENCY_KEY_REUSED", status: 409 });
  });

  it("converges concurrent duplicate requests on one order", async () => {
    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        createOrder({ customerId, input, idempotencyKey: "key-12345678" }),
      ),
    );

    expect(new Set(results.map((r) => r.order.id)).size).toBe(1);
    expect(await db.select().from(orders)).toHaveLength(1);
    expect(await db.select().from(idempotencyRecords)).toHaveLength(1);
  });
});
