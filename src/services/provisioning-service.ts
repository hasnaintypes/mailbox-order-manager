import type { ProviderResolver } from "@/providers";
import {
  type Claim,
  claimNextOrder,
  finalizeOrder,
  listUnfinishedMailboxes,
  recordMailboxResult,
  renewLease,
} from "@/repositories/provisioning-repository";

export type ProvisionOutcome =
  | { processed: false }
  | { processed: true; orderId: string; result: "ACTIVE" | "FAILED" | "CLAIM_LOST" };

async function provisionMailboxes(
  claim: Claim,
  resolveProvider: ProviderResolver,
  leaseMs: number,
): Promise<"ACTIVE" | "FAILED" | "CLAIM_LOST"> {
  const provider = resolveProvider(claim.provider);

  // ACTIVE mailboxes from an earlier run are skipped, so they are never provisioned twice.
  for (const mailbox of await listUnfinishedMailboxes(claim.orderId)) {
    // Provider calls run outside any DB transaction; the lease is renewed between them.
    if (!(await renewLease(claim, leaseMs))) {
      return "CLAIM_LOST";
    }

    const result = await provider.provision({
      provisioningKey: mailbox.provisioningKey,
      domain: claim.domain,
      ordinal: mailbox.ordinal,
    });

    if (!(await recordMailboxResult(claim, mailbox, result))) {
      return "CLAIM_LOST";
    }
  }

  return (await finalizeOrder(claim)) ?? "CLAIM_LOST";
}

/** Claims and processes at most one order. Safe to run from several workers at once. */
export async function processNextOrder(options: {
  resolveProvider: ProviderResolver;
  leaseMs: number;
}): Promise<ProvisionOutcome> {
  const claim = await claimNextOrder(options.leaseMs);

  if (!claim) {
    return { processed: false };
  }

  const result = await provisionMailboxes(
    claim,
    options.resolveProvider,
    options.leaseMs,
  );

  return { processed: true, orderId: claim.orderId, result };
}
