import { z } from "zod";
import {
  ORDER_STATUSES,
  PROVIDER_NAMES,
} from "@/domain/orders/status";

const DOMAIN_REGEX =
  /^(?=.{3,253}$)(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/;

export const domainSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
  z
    .string()
    .min(3, "Domain must be at least 3 characters.")
    .max(253, "Domain must be at most 253 characters.")
    .regex(DOMAIN_REGEX, "Enter a valid domain, for example example.com."),
);

export const providerSchema = z.enum(PROVIDER_NAMES);

export const createOrderSchema = z.object({
  domain: domainSchema,
  provider: providerSchema,
  mailboxCount: z.coerce
    .number()
    .int("Mailbox count must be a whole number.")
    .min(1, "Mailbox count must be at least 1.")
    .max(50, "Mailbox count must be at most 50."),
});

export const idempotencyKeySchema = z
  .string()
  .trim()
  .min(8, "Idempotency-Key must be at least 8 characters.")
  .max(255, "Idempotency-Key must be at most 255 characters.");

export const orderIdSchema = z.string().uuid("Order id must be a UUID.");

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const adminOrderFiltersSchema = paginationSchema.extend({
  status: z.enum(ORDER_STATUSES).optional(),
  provider: providerSchema.optional(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email is required.")
    .max(320, "Email is too long.")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address."),
  password: z.string().min(1, "Password is required.").max(200),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type AdminOrderFilters = z.infer<typeof adminOrderFiltersSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
