ALTER TABLE "forms" ADD COLUMN IF NOT EXISTS "opens_at" timestamp;--> statement-breakpoint
ALTER TABLE "responses" ADD COLUMN IF NOT EXISTS "read_at" timestamp;
