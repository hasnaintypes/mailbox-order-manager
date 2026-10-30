import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { db, sqlClient } from "@/db/client";
import { users } from "@/db/schema";
import { getAdminOrder, listAdminOrders } from "@/services/admin-orders";
import { getCustomerOrder, listCustomerOrders } from "@/services/customer-orders";
import { newOrder, resetDatabase, seedUsers } from "./helpers";

let customerId: string;
let otherCustomerId: string;

beforeEach(async () => {
  await resetDatabase();
  ({ customerId } = await seedUsers());
  const [other] = await db
    .insert(users)
    .values({ email: "other@test.dev", passwordHash: "x", role: "customer" })
    .returning();
  otherCustomerId = other!.id;
});

afterAll(async () => {
  await sqlClient.end();
});

describe("customer isolation", () => {
  it("hides another customer's order detail as not found", async () => {
    const order = await newOrder(customerId);

    await expect(getCustomerOrder(otherCustomerId, order.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
      status: 404,
    });
    await expect(getCustomerOrder(customerId, order.id)).resolves.toMatchObject({
      order: { id: order.id },
    });
  });

  it("lists only the caller's own orders", async () => {
    await newOrder(customerId);
    await newOrder(customerId);
    await newOrder(otherCustomerId);

    expect((await listCustomerOrders(customerId, 1, 20)).items).toHaveLength(2);
    expect((await listCustomerOrders(otherCustomerId, 1, 20)).items).toHaveLength(1);
  });

  it("lets the admin services see every customer's orders", async () => {
    const order = await newOrder(otherCustomerId);
    await newOrder(customerId);

    expect((await listAdminOrders({ page: 1, pageSize: 10 })).total).toBe(2);
    await expect(getAdminOrder(order.id)).resolves.toMatchObject({ order: { id: order.id } });
  });
});
