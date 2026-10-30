import { eq } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { db, sqlClient } from "@/db/client";
import { mailboxes, orderAuditLogs, orders } from "@/db/schema";
import {
  claimNextOrder,
  recordMailboxResult,
} from "@/repositories/provisioning-repository";
import { processNextOrder } from "@/services/provisioning-service";
import { fakeProvider, newOrder, resetDatabase, seedUsers } from "./helpers";

let customerId: string;

beforeEach(async () => {
  await resetDatabase();
  ({ customerId } = await seedUsers());
});

afterAll(async () => {
  await sqlClient.end();
});

const auditOf = (orderId: string) =>
  db.select().from(orderAuditLogs).where(eq(orderAuditLogs.orderId, orderId)).orderBy(orderAuditLogs.sequence);

describe("worker", () => {
  it("provisions an order to ACTIVE with an ordered audit trail", async () => {
    const order = await newOrder(customerId, 3);
    const { resolve, calls } = fakeProvider();

    const outcome = await processNextOrder({ resolveProvider: resolve, leaseMs: 45_000 });

    expect(outcome).toMatchObject({ processed: true, result: "ACTIVE" });
    expect(calls).toHaveLength(3);
    const [row] = await db.select().from(orders).where(eq(orders.id, order.id));
    expect(row?.status).toBe("ACTIVE");
    expect(row?.claimToken).toBeNull();

    const audit = await auditOf(order.id);
    expect(audit.map((a) => [a.sequence, a.fromStatus, a.toStatus])).toEqual([
      [1, null, "PENDING"],
      [2, "PENDING", "PROVISIONING"],
      [3, "PROVISIONING", "ACTIVE"],
    ]);
  });

  it("marks the order FAILED when a mailbox fails and keeps successful mailboxes", async () => {
    const order = await newOrder(customerId, 3);
    const { resolve } = fakeProvider((ordinal) => ordinal === 2);

    await processNextOrder({ resolveProvider: resolve, leaseMs: 45_000 });

    const [row] = await db.select().from(orders).where(eq(orders.id, order.id));
    expect(row?.status).toBe("FAILED");
    const rows = await db.select().from(mailboxes).where(eq(mailboxes.orderId, order.id)).orderBy(mailboxes.ordinal);
    expect(rows.map((m) => m.status)).toEqual(["ACTIVE", "FAILED", "ACTIVE"]);
    expect(rows[1]?.failureCode).toBe("TEST_FAILURE");
  });

  it("never processes the same order twice when workers run concurrently", async () => {
    const order = await newOrder(customerId, 4);
    const { resolve, calls } = fakeProvider();

    const outcomes = await Promise.all(
      Array.from({ length: 4 }, () => processNextOrder({ resolveProvider: resolve, leaseMs: 45_000 })),
    );

    expect(outcomes.filter((o) => o.processed)).toHaveLength(1);
    expect(calls).toHaveLength(4);
    const provisioning = (await auditOf(order.id)).filter((a) => a.toStatus === "PROVISIONING");
    expect(provisioning).toHaveLength(1);
  });

  it("reclaims an expired lease and fences the stale worker", async () => {
    const order = await newOrder(customerId, 1);
    const stale = await claimNextOrder(45_000);
    expect(stale?.orderId).toBe(order.id);

    // Not reclaimable while the lease is live.
    expect(await claimNextOrder(45_000)).toBeNull();

    await db.update(orders).set({ claimExpiresAt: new Date(Date.now() - 1000) }).where(eq(orders.id, order.id));
    const fresh = await claimNextOrder(45_000);
    expect(fresh?.claimGeneration).toBe((stale?.claimGeneration ?? 0) + 1);

    const [mailbox] = await db.select().from(mailboxes).where(eq(mailboxes.orderId, order.id));
    const staleWrite = await recordMailboxResult(stale!, mailbox!, { outcome: "ACTIVE", providerReference: "late" });
    expect(staleWrite).toBe(false);

    const events = await auditOf(order.id);
    expect(events.at(-1)).toMatchObject({ eventType: "LEASE_RECLAIMED", fromStatus: null, toStatus: null });
  });
});
