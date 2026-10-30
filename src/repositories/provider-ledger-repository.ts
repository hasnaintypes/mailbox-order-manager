import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { providerProvisioningOperations as operations } from "@/db/schema";
import type { OperationLedger, ProvisionResult } from "@/providers/types";

function toResult(row: typeof operations.$inferSelect): ProvisionResult {
  return row.outcome === "ACTIVE"
    ? { outcome: "ACTIVE", providerReference: row.providerReference ?? "" }
    : { outcome: "FAILED", failureCode: row.failureCode ?? "PROVIDER_ERROR" };
}

export const dbOperationLedger: OperationLedger = {
  async find(provisioningKey) {
    const [row] = await db
      .select()
      .from(operations)
      .where(eq(operations.provisioningKey, provisioningKey));
    return row ? toResult(row) : null;
  },

  async record(provisioningKey, provider, result) {
    await db
      .insert(operations)
      .values({
        provisioningKey,
        provider,
        outcome: result.outcome,
        providerReference:
          result.outcome === "ACTIVE" ? result.providerReference : null,
        failureCode: result.outcome === "FAILED" ? result.failureCode : null,
      })
      .onConflictDoNothing();

    const [row] = await db
      .select()
      .from(operations)
      .where(eq(operations.provisioningKey, provisioningKey));

    if (!row) {
      throw new Error("Provider operation was not recorded.");
    }

    return toResult(row);
  },
};
