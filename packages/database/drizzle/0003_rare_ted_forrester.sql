ALTER TABLE "users" ADD COLUMN "reset_password_token" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "reset_password_token_expires" timestamp;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "notify_on_response" boolean DEFAULT false;