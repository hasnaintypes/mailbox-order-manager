import { randomUUID } from "node:crypto";

import { and, asc, eq, ne, sql } from "drizzle-orm";

import { db } from "@/db/client";
import { mailboxes, orders } from "@/db/schema";
import { assertTransition } from "@/domain/orders/state-machine";
import type { ProviderName } from "@/domain/orders/status";
import type { ProvisionResult } from "@/providers/types";
import { appendAuditEvent } from "./audit-repository";

export type Claim = {
  orderId: string;
  provider: ProviderName;
  domain: string;
  claimToken: string;
  claimGeneration: number;
};

const leaseExpiry = (leaseMs: number) =>
  sql`now() + (${leaseMs} * interval '1 millisecond')`;

/**
 * Claims one PENDING order, or reclaims one whose PROVISIONING lease expired.
 * SKIP LOCKED lets concurrent workers pick different rows and never the same one.
 */
export function claimNextOrder(leaseMs: number): Promise<Claim | null> {
  return db.transaction(async (tx) => {
    const candidates = await tx.execute<{ id: string; status: string }>(sql`
      select id, status from orders
      where status = 'PENDING'
         or (status = 'PROVISIONING' and claim_expires_at < now())
      order by created_at
      limit 1
      for update skip locked
    `);
    const candidate = candidates[0];

    if (!candidate) {
      return null;
    }

    const reclaimed = candidate.status === "PROVISIONING";
    const claimToken = randomUUID();
    const [order] = await tx
      .update(orders)
      .set({
        status: "PROVISIONING",
        claimToken,
        claimGeneration: sql`${orders.claimGeneration} + 1`,
        claimExpiresAt: leaseExpiry(leaseMs),
      })
      .where(eq(orders.id, candidate.id))
      .returning();

    if (!order) {
      return null;
    }

    await appendAuditEvent(tx, {
      orderId: order.id,
      eventType: reclaimed ? "LEASE_RECLAIMED" : "TRANSITION",
      fromStatus: reclaimed ? undefined : "PENDING",
      toStatus: reclaimed ? undefined : "PROVISIONING",
      actorType: "worker",
      claimToken,
      claimGeneration: order.claimGeneration,
    });

    return {
      orderId: order.id,
      provider: order.provider,
      domain: order.domain,
      claimToken,
      claimGeneration: order.claimGeneration,
    };
  });
}

const ownsClaim = (claim: Claim) =>
  and(
    eq(orders.id, claim.orderId),
    eq(orders.status, "PROVISIONING"),
    eq(orders.claimToken, claim.claimToken),
    eq(orders.claimGeneration, claim.claimGeneration),
  );

/** Extends the lease; false means this worker no longer owns the order. */
export async function renewLease(claim: Claim, leaseMs: number) {
  const rows = await db
    .update(orders)
    .set({ claimExpiresAt: leaseExpiry(leaseMs) })
    .where(ownsClaim(claim))
    .returning({ id: orders.id });
  return rows.length === 1;
}

export function listUnfinishedMailboxes(orderId: string) {
  return db
    .select()
    .from(mailboxes)
    .where(and(eq(mailboxes.orderId, orderId), ne(mailboxes.status, "ACTIVE")))
    .orderBy(asc(mailboxes.ordinal));
}

/** Writes a mailbox result only while the claim is still current; false means stale. */
export function recordMailboxResult(
  claim: Claim,
  mailbox: { id: string; provisioningKey: string },
  result: ProvisionResult,
): Promise<boolean> {
  return db.transaction(async (tx) => {
    const [owned] = await tx
      .select({ id: orders.id })
      .from(orders)
      .where(ownsClaim(claim))
      .for("update");

    if (!owned) {
      return false;
    }

    await tx
      .update(mailboxes)
      .set({
        status: result.outcome,
        providerReference:
          result.outcome === "ACTIVE" ? result.providerReference : null,
        failureCode: result.outcome === "FAILED" ? result.failureCode : null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(mailboxes.id, mailbox.id),
          eq(mailboxes.provisioningKey, mailbox.provisioningKey),
        ),
      );

    return true;
  });
}

/** Moves the order to ACTIVE (all mailboxes active) or FAILED, audited atomically. */
export function finalizeOrder(claim: Claim): Promise<"ACTIVE" | "FAILED" | null> {
  return db.transaction(async (tx) => {
    const [owned] = await tx
      .select({ id: orders.id })
      .from(orders)
      .where(ownsClaim(claim))
      .for("update");

    if (!owned) {
      return null;
    }

    const unfinished = await tx
      .select({ id: mailboxes.id })
      .from(mailboxes)
      .where(
        and(eq(mailboxes.orderId, claim.orderId), ne(mailboxes.status, "ACTIVE")),
      );
    const next = unfinished.length === 0 ? "ACTIVE" : "FAILED";
    assertTransition("PROVISIONING", next);

    await tx
      .update(orders)
      .set({
        status: next,
        claimToken: null,
        claimExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, claim.orderId));

    await appendAuditEvent(tx, {
      orderId: claim.orderId,
      fromStatus: "PROVISIONING",
      toStatus: next,
      actorType: "worker",
      claimToken: claim.claimToken,
      claimGeneration: claim.claimGeneration,
    });

    return next;
  });
}
