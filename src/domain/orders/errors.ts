import type { OrderStatus } from "./status";

export class InvalidTransitionError extends Error {
  constructor(
    public readonly from: OrderStatus,
    public readonly to: OrderStatus,
  ) {
    super(`Invalid order transition: ${from} -> ${to}`);
    this.name = "InvalidTransitionError";
  }
}
