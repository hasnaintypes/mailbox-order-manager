import { eq } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { db, sqlClient } from "@/db/client";
import { mailboxes, orderAuditLogs } from "@/db/schema";
import { listAdminOrders } from "@/services/admin-orders";
import { processNextOrder } from "@/services/provisioning-service";
import { retryOrder } from "@/services/retry-order";
import { fakeProvider, newOrder, resetDatabase, seedUsers } from "./helpers";

let customerId: string;
let adminId: string;

beforeEach(async () => {
  await resetDatabase();
  ({ customerId, adminId } = await seedUsers());
});

afterAll(async () => {
  await sqlClient.end();
});

describe("admin retry", () => {
  it("retries a FAILED order, re-provisions only failed mailboxes, and audits it", async () => {
    const order = await newOrder(customerId, 3);
    let failing = true;
    const { resolve, calls } = fakeProvider((ordinal) => failing && ordinal === 2);

    await processNextOrder({ resolveProvider: resolve, leaseMs: 45_000 });
    expect(calls).toHaveLength(3);

    const retried = await retryOrder(adminId, order.id);
    expect(retried.status).toBe("PENDING");

    failing = false;
    const outcome = await processNextOrder({ resolveProvider: resolve, leaseMs: 45_000 });

    expect(outcome).toMatchObject({ processed: true, result: "ACTIVE" });
    expect(calls).toHaveLength(4); // only the failed mailbox was provisioned again
    const rows = await db.select().from(mailboxes).where(eq(mailboxes.orderId, order.id));
    expect(rows.every((m) => m.status === "ACTIVE")).toBe(true);

    const audit = await db.select().from(orderAuditLogs).where(eq(orderAuditLogs.orderId, order.id)).orderBy(orderAuditLogs.sequence);
    expect(audit.map((a) => `${a.fromStatus ?? "-"}>${a.toStatus}`)).toEqual([
      "->PENDING",
      "PENDING>PROVISIONING",
      "PROVISIONING>FAILED",
      "FAILED>PENDING",
      "PENDING>PROVISIONING",
      "PROVISIONING>ACTIVE",
    ]);
    expect(audit[3]).toMatchObject({ actorType: "admin", actorUserId: adminId });
  });

  it("rejects retry for non-FAILED orders without changing state or audit", async () => {
    const order = await newOrder(customerId, 1);

    await expect(retryOrder(adminId, order.id)).rejects.toMatchObject({
      code: "INVALID_TRANSITION",
      status: 409,
    });

    const audit = await db.select().from(orderAuditLogs).where(eq(orderAuditLogs.orderId, order.id));
    expect(audit).toHaveLength(1);
  });

  it("lets only one of two racing retries succeed", async () => {
    const order = await newOrder(customerId, 1);
    await processNextOrder({ resolveProvider: fakeProvider(() => true).resolve, leaseMs: 45_000 });

    const results = await Promise.allSettled([
      retryOrder(adminId, order.id),
      retryOrder(adminId, order.id),
    ]);

    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  });
});

describe("admin list", () => {
  it("filters by status and provider and paginates", async () => {
    await newOrder(customerId, 1);
    await newOrder(customerId, 1);
    await newOrder(customerId, 1);
    await processNextOrder({ resolveProvider: fakeProvider().resolve, leaseMs: 45_000 });

    const active = await listAdminOrders({ status: "ACTIVE", page: 1, pageSize: 10 });
    expect(active.total).toBe(1);

    const pageOne = await listAdminOrders({ page: 1, pageSize: 2 });
    expect(pageOne.items).toHaveLength(2);
    expect(pageOne.totalPages).toBe(2);

    const none = await listAdminOrders({ provider: "microsoft", page: 1, pageSize: 10 });
    expect(none.total).toBe(0);
  });
});
