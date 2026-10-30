CREATE TYPE "public"."actor_type" AS ENUM('customer', 'admin', 'worker');--> statement-breakpoint
CREATE TYPE "public"."audit_event_type" AS ENUM('TRANSITION', 'LEASE_RECLAIMED');--> statement-breakpoint
CREATE TYPE "public"."mailbox_status" AS ENUM('PENDING', 'PROVISIONING', 'ACTIVE', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('PENDING', 'PROVISIONING', 'ACTIVE', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."provider_outcome" AS ENUM('ACTIVE', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."provider_type" AS ENUM('google', 'microsoft');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('customer', 'admin');--> statement-breakpoint
CREATE TABLE "idempotency_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"idempotency_key" varchar(255) NOT NULL,
	"request_fingerprint" char(64) NOT NULL,
	"order_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mailboxes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"ordinal" smallint NOT NULL,
	"status" "mailbox_status" DEFAULT 'PENDING' NOT NULL,
	"provision_attempt" integer DEFAULT 1 NOT NULL,
	"provisioning_key" uuid DEFAULT gen_random_uuid() NOT NULL,
	"provider_reference" text,
	"failure_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"sequence" integer NOT NULL,
	"event_type" "audit_event_type" DEFAULT 'TRANSITION' NOT NULL,
	"from_status" "order_status",
	"to_status" "order_status",
	"actor_type" "actor_type" NOT NULL,
	"actor_user_id" uuid,
	"claim_token" uuid,
	"claim_generation" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"domain" varchar(253) NOT NULL,
	"provider" "provider_type" NOT NULL,
	"mailbox_count" smallint NOT NULL,
	"status" "order_status" DEFAULT 'PENDING' NOT NULL,
	"claim_token" uuid,
	"claim_generation" integer DEFAULT 0 NOT NULL,
	"claim_expires_at" timestamp with time zone,
	"audit_sequence" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_mailbox_count_check" CHECK ("orders"."mailbox_count" between 1 and 50)
);
--> statement-breakpoint
CREATE TABLE "provider_provisioning_operations" (
	"provisioning_key" uuid PRIMARY KEY NOT NULL,
	"provider" "provider_type" NOT NULL,
	"outcome" "provider_outcome" NOT NULL,
	"provider_reference" text,
	"failure_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(320) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'customer' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "idempotency_records" ADD CONSTRAINT "idempotency_records_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "idempotency_records" ADD CONSTRAINT "idempotency_records_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mailboxes" ADD CONSTRAINT "mailboxes_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_audit_logs" ADD CONSTRAINT "order_audit_logs_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_audit_logs" ADD CONSTRAINT "order_audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_users_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idempotency_records_customer_key_unique" ON "idempotency_records" USING btree ("customer_id","idempotency_key");--> statement-breakpoint
CREATE INDEX "idempotency_records_order_idx" ON "idempotency_records" USING btree ("order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mailboxes_order_ordinal_unique" ON "mailboxes" USING btree ("order_id","ordinal");--> statement-breakpoint
CREATE UNIQUE INDEX "mailboxes_provisioning_key_unique" ON "mailboxes" USING btree ("provisioning_key");--> statement-breakpoint
CREATE INDEX "mailboxes_order_status_idx" ON "mailboxes" USING btree ("order_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "order_audit_logs_order_sequence_unique" ON "order_audit_logs" USING btree ("order_id","sequence");--> statement-breakpoint
CREATE INDEX "order_audit_logs_order_sequence_idx" ON "order_audit_logs" USING btree ("order_id","sequence");--> statement-breakpoint
CREATE INDEX "orders_customer_created_idx" ON "orders" USING btree ("customer_id","created_at");--> statement-breakpoint
CREATE INDEX "orders_status_created_idx" ON "orders" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "orders_provider_status_created_idx" ON "orders" USING btree ("provider","status","created_at");--> statement-breakpoint
CREATE INDEX "provider_operations_provider_idx" ON "provider_provisioning_operations" USING btree ("provider");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");