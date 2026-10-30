import { InvalidTransitionError } from "./errors";
import type { OrderStatus } from "./status";

export const ALLOWED_TRANSITIONS: Readonly<
  Record<OrderStatus, readonly OrderStatus[]>
> = {
  PENDING: ["PROVISIONING"],
  PROVISIONING: ["ACTIVE", "FAILED"],
  ACTIVE: [],
  FAILED: ["PENDING"],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransition(from, to)) {
    throw new InvalidTransitionError(from, to);
  }
}
