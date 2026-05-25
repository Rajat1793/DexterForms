import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const formsTable = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),

  creatorId: uuid("creator_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),

  slug: varchar("slug", { length: 100 }).unique(),

  // draft | published | closed
  status: varchar("status", { length: 20 }).notNull().default("draft"),

  // public | unlisted
  visibility: varchar("visibility", { length: 20 }).notNull().default("public"),

  themeId: varchar("theme_id", { length: 50 }).default("minimal"),

  customColors: jsonb("custom_colors"),

  acceptingResponses: boolean("accepting_responses").default(true),
  maxResponses: integer("max_responses"),
  expiresAt: timestamp("expires_at"),

  requiresPassword: boolean("requires_password").default(false),
  passwordHash: varchar("password_hash", { length: 255 }),

  successMessage: text("success_message").default("Thank you for your response!"),
  redirectUrl: varchar("redirect_url", { length: 500 }),

  showProgressBar: boolean("show_progress_bar").default(true),
  isMultiPage: boolean("is_multi_page").default(false),
  totalPages: integer("total_pages").default(1),

  responseCount: integer("response_count").default(0),

  notifyOnResponse: boolean("notify_on_response").default(false),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type SelectForm = typeof formsTable.$inferSelect;
export type InsertForm = typeof formsTable.$inferInsert;
