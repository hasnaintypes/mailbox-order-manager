export const ORDER_STATUSES = [
  "PENDING",
  "PROVISIONING",
  "ACTIVE",
  "FAILED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PROVIDER_NAMES = ["google", "microsoft"] as const;

export type ProviderName = (typeof PROVIDER_NAMES)[number];

export const MAILBOX_STATUSES = [
  "PENDING",
  "PROVISIONING",
  "ACTIVE",
  "FAILED",
] as const;

export type MailboxStatus = (typeof MAILBOX_STATUSES)[number];

export const TERMINAL_ORDER_STATUSES: readonly OrderStatus[] = [
  "ACTIVE",
  "FAILED",
];
