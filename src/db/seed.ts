import "dotenv/config";

import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";

import { db, sqlClient } from "./client";
import { users } from "./schema";

const seedUsers = [
  { email: "admin@example.test", role: "admin" as const },
  { email: "customer@example.test", role: "customer" as const },
];

async function seed() {
  const password = process.env.SEED_PASSWORD ?? "ChangeMe123!";
  const passwordHash = await hash(password, 12);

  for (const user of seedUsers) {
    const existing = await db.query.users.findFirst({
      where: eq(users.email, user.email),
    });

    if (!existing) {
      await db.insert(users).values({ ...user, passwordHash });
    }
  }
}

seed()
  .then(() => {
    console.info("Seeded admin@example.test and customer@example.test.");
  })
  .finally(async () => {
    await sqlClient.end();
  });
