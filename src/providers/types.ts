import type { ProviderName } from "@/domain/orders/status";

export type ProvisionRequest = {
  provisioningKey: string;
  domain: string;
  ordinal: number;
};

export type ProvisionResult =
  | { outcome: "ACTIVE"; providerReference: string }
  | { outcome: "FAILED"; failureCode: string };

export interface MailboxProvider {
  readonly name: ProviderName;
  provision(request: ProvisionRequest): Promise<ProvisionResult>;
}

/** Durable per-key result store so a repeated provider call returns the same outcome. */
export interface OperationLedger {
  find(provisioningKey: string): Promise<ProvisionResult | null>;
  /** Stores the result unless one exists; always returns the winning result. */
  record(
    provisioningKey: string,
    provider: ProviderName,
    result: ProvisionResult,
  ): Promise<ProvisionResult>;
}
