import { randomUUID } from "node:crypto";

import type { ProviderName } from "@/domain/orders/status";
import type {
  MailboxProvider,
  OperationLedger,
  ProvisionRequest,
  ProvisionResult,
} from "./types";

export type MockProviderOptions = {
  delayMs: number;
  failureRate: number;
  ledger: OperationLedger;
  /** Injectable for deterministic tests. */
  random?: () => number;
};

const sleep = (ms: number) =>
  ms > 0 ? new Promise<void>((resolve) => setTimeout(resolve, ms)) : Promise.resolve();

/** Simulates a provider API. Repeated calls with one provisioning key return the stored result. */
export class MockMailboxProvider implements MailboxProvider {
  constructor(
    readonly name: ProviderName,
    private readonly options: MockProviderOptions,
  ) {}

  async provision(request: ProvisionRequest): Promise<ProvisionResult> {
    const { ledger, delayMs, failureRate, random = Math.random } = this.options;
    const existing = await ledger.find(request.provisioningKey);

    if (existing) {
      return existing;
    }

    await sleep(delayMs);

    const result: ProvisionResult =
      random() < failureRate
        ? { outcome: "FAILED", failureCode: "PROVIDER_UNAVAILABLE" }
        : {
            outcome: "ACTIVE",
            providerReference: `${this.name}-${randomUUID()}`,
          };

    return ledger.record(request.provisioningKey, this.name, result);
  }
}
