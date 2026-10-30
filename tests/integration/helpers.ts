import { db } from "@/db/client";
import { idempotencyRecords, orders, providerProvisioningOperations, users } from "@/db/schema";
import type { MailboxProvider, ProvisionResult } from "@/providers/types";
import { createOrder } from "@/services/create-order";

export async function resetDatabase() {
  await db.delete(idempotencyRecords);
  await db.delete(orders);
  await db.delete(providerProvisioningOperations);
  await db.delete(users);
}

export async function seedUsers() {
  const [customer, admin] = await db
    .insert(users)
    .values([
      { email: "c@test.dev", passwordHash: "x", role: "customer" },
      { email: "a@test.dev", passwordHash: "x", role: "admin" },
    ])
    .returning();
  return { customerId: customer!.id, adminId: admin!.id };
}

let keyCounter = 0;

export async function newOrder(customerId: string, mailboxCount = 2) {
  const { order } = await createOrder({
    customerId,
    input: { domain: "acme.com", provider: "google", mailboxCount },
    idempotencyKey: `test-key-${++keyCounter}-${Date.now()}`,
  });
  return order;
}

/** Deterministic provider: `fail` decides per call; counts every provision call. */
export function fakeProvider(fail: (ordinal: number) => boolean = () => false) {
  const calls: string[] = [];
  const provider: MailboxProvider = {
    name: "google",
    async provision(request): Promise<ProvisionResult> {
      calls.push(request.provisioningKey);
      await new Promise((resolve) => setTimeout(resolve, 5));
      return fail(request.ordinal)
        ? { outcome: "FAILED", failureCode: "TEST_FAILURE" }
        : { outcome: "ACTIVE", providerReference: `ref-${request.ordinal}` };
    },
  };
  return { provider, calls, resolve: () => provider };
}
