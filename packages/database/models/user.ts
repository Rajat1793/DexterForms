import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  fullName: varchar("full_name", { length: 80 }).notNull(),

  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false),

  passwordHash: varchar("password_hash", { length: 255 }),

  profileImageUrl: text("profile_image_url"),

  plan: varchar("plan", { length: 20 }).notNull().default("FREE"),

  resetPasswordToken: varchar("reset_password_token", { length: 255 }),
  resetPasswordTokenExpires: timestamp("reset_password_token_expires"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
