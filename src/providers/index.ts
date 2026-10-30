import type { ProviderName } from "@/domain/orders/status";
import { env } from "@/lib/env";
import { dbOperationLedger } from "@/repositories/provider-ledger-repository";
import { MockMailboxProvider } from "./mock-provider";
import type { MailboxProvider } from "./types";

export type ProviderResolver = (name: ProviderName) => MailboxProvider;

/** Strategy selector: one provider implementation per supported provider name. */
export const resolveProvider: ProviderResolver = (name) =>
  new MockMailboxProvider(name, {
    delayMs: env.PROVIDER_DELAY_MS,
    failureRate: env.PROVIDER_FAILURE_RATE,
    ledger: dbOperationLedger,
  });
