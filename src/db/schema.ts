import { sql } from "drizzle-orm";
import {
  char,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["customer", "admin"]);
export const providerType = pgEnum("provider_type", ["google", "microsoft"]);
export const orderStatus = pgEnum("order_status", [
  "PENDING",
  "PROVISIONING",
  "ACTIVE",
  "FAILED",
]);
export const mailboxStatus = pgEnum("mailbox_status", [
  "PENDING",
  "PROVISIONING",
  "ACTIVE",
  "FAILED",
]);
export const actorType = pgEnum("actor_type", ["customer", "admin", "worker"]);
export const auditEventType = pgEnum("audit_event_type", [
  "TRANSITION",
  "LEASE_RECLAIMED",
]);
export const providerOutcome = pgEnum("provider_outcome", ["ACTIVE", "FAILED"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 320 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: userRole("role").notNull().default("customer"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    domain: varchar("domain", { length: 253 }).notNull(),
    provider: providerType("provider").notNull(),
    mailboxCount: smallint("mailbox_count").notNull(),
    status: orderStatus("status").notNull().default("PENDING"),
    claimToken: uuid("claim_token"),
    claimGeneration: integer("claim_generation").notNull().default(0),
    claimExpiresAt: timestamp("claim_expires_at", { withTimezone: true }),
    auditSequence: integer("audit_sequence").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "orders_mailbox_count_check",
      sql`${table.mailboxCount} between 1 and 50`,
    ),
    index("orders_customer_created_idx").on(table.customerId, table.createdAt),
    index("orders_status_created_idx").on(table.status, table.createdAt),
    index("orders_provider_status_created_idx").on(
      table.provider,
      table.status,
      table.createdAt,
    ),
  ],
);

export const mailboxes = pgTable(
  "mailboxes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    ordinal: smallint("ordinal").notNull(),
    status: mailboxStatus("status").notNull().default("PENDING"),
    provisionAttempt: integer("provision_attempt").notNull().default(1),
    provisioningKey: uuid("provisioning_key").notNull().defaultRandom(),
    providerReference: text("provider_reference"),
    failureCode: text("failure_code"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("mailboxes_order_ordinal_unique").on(
      table.orderId,
      table.ordinal,
    ),
    uniqueIndex("mailboxes_provisioning_key_unique").on(
      table.provisioningKey,
    ),
    index("mailboxes_order_status_idx").on(table.orderId, table.status),
  ],
);

export const providerProvisioningOperations = pgTable(
  "provider_provisioning_operations",
  {
    provisioningKey: uuid("provisioning_key").primaryKey(),
    provider: providerType("provider").notNull(),
    outcome: providerOutcome("outcome").notNull(),
    providerReference: text("provider_reference"),
    failureCode: text("failure_code"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("provider_operations_provider_idx").on(table.provider)],
);

export const orderAuditLogs = pgTable(
  "order_audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    sequence: integer("sequence").notNull(),
    eventType: auditEventType("event_type").notNull().default("TRANSITION"),
    fromStatus: orderStatus("from_status"),
    toStatus: orderStatus("to_status"),
    actorType: actorType("actor_type").notNull(),
    actorUserId: uuid("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    claimToken: uuid("claim_token"),
    claimGeneration: integer("claim_generation"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("order_audit_logs_order_sequence_unique").on(
      table.orderId,
      table.sequence,
    ),
    index("order_audit_logs_order_sequence_idx").on(
      table.orderId,
      table.sequence,
    ),
  ],
);

export const idempotencyRecords = pgTable(
  "idempotency_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    idempotencyKey: varchar("idempotency_key", { length: 255 }).notNull(),
    requestFingerprint: char("request_fingerprint", { length: 64 }).notNull(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("idempotency_records_customer_key_unique").on(
      table.customerId,
      table.idempotencyKey,
    ),
    index("idempotency_records_order_idx").on(table.orderId),
  ],
);

export type User = typeof users.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Mailbox = typeof mailboxes.$inferSelect;
export type OrderAuditLog = typeof orderAuditLogs.$inferSelect;
export type IdempotencyRecord = typeof idempotencyRecords.$inferSelect;
export type ProviderProvisioningOperation =
  typeof providerProvisioningOperations.$inferSelect;
