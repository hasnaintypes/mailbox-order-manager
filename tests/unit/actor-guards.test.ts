import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.fn();
vi.mock("@/auth", () => ({ auth: () => auth() }));

import { requireActor, requireAdmin, requireCustomer } from "@/auth/actor";

const session = (role: "customer" | "admin") => ({ user: { id: "user-1", role } });

beforeEach(() => auth.mockReset());

describe("actor guards", () => {
  it("rejects unauthenticated callers with 401", async () => {
    auth.mockResolvedValue(null);
    await expect(requireActor()).rejects.toMatchObject({ code: "UNAUTHENTICATED", status: 401 });
  });

  it("rejects a customer on admin-only actions with 403", async () => {
    auth.mockResolvedValue(session("customer"));
    await expect(requireAdmin()).rejects.toMatchObject({ code: "FORBIDDEN", status: 403 });
  });

  it("rejects an admin on customer-only actions with 403", async () => {
    auth.mockResolvedValue(session("admin"));
    await expect(requireCustomer()).rejects.toMatchObject({ code: "FORBIDDEN", status: 403 });
  });

  it("returns the actor for the matching role", async () => {
    auth.mockResolvedValue(session("admin"));
    await expect(requireAdmin()).resolves.toEqual({ id: "user-1", role: "admin" });
  });
});
