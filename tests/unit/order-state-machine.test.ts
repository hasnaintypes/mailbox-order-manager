import { describe, expect, it } from "vitest";

import { InvalidTransitionError } from "@/domain/orders/errors";
import {
  assertTransition,
  canTransition,
} from "@/domain/orders/state-machine";
import type { OrderStatus } from "@/domain/orders/status";

const validTransitions: ReadonlyArray<readonly [OrderStatus, OrderStatus]> = [
  ["PENDING", "PROVISIONING"],
  ["PROVISIONING", "ACTIVE"],
  ["PROVISIONING", "FAILED"],
  ["FAILED", "PENDING"],
];

const statuses: readonly OrderStatus[] = [
  "PENDING",
  "PROVISIONING",
  "ACTIVE",
  "FAILED",
];

describe("order state machine", () => {
  it.each(validTransitions)("accepts %s -> %s", (from, to) => {
    expect(canTransition(from, to)).toBe(true);
    expect(() => assertTransition(from, to)).not.toThrow();
  });

  it.each(
    statuses.flatMap((from) =>
      statuses
        .filter(
          (to) =>
            !validTransitions.some(
              ([validFrom, validTo]) => validFrom === from && validTo === to,
            ),
        )
        .map((to) => [from, to] as const),
    ),
  )("rejects %s -> %s", (from, to) => {
    expect(canTransition(from, to)).toBe(false);
    expect(() => assertTransition(from, to)).toThrow(InvalidTransitionError);
  });
});
