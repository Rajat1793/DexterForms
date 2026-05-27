import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  text,
  jsonb,
} from "drizzle-orm/pg-core";
import { formsTable } from "./form";
import { formFieldsTable } from "./form-field";

export const responsesTable = pgTable("responses", {
  id: uuid("id").primaryKey().defaultRandom(),

  formId: uuid("form_id")
    .notNull()
    .references(() => formsTable.id, { onDelete: "cascade" }),

  respondentEmail: varchar("respondent_email", { length: 255 }),
  respondentName: varchar("respondent_name", { length: 255 }),

  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),

  // Duration in seconds to complete the form
  completionTime: integer("completion_time"),

  metadata: jsonb("metadata"),

  readAt: timestamp("read_at"),

  createdAt: timestamp("created_at").defaultNow(),
});

export const responseAnswersTable = pgTable("response_answers", {
  id: uuid("id").primaryKey().defaultRandom(),

  responseId: uuid("response_id")
    .notNull()
    .references(() => responsesTable.id, { onDelete: "cascade" }),

  fieldId: uuid("field_id")
    .notNull()
    .references(() => formFieldsTable.id, { onDelete: "cascade" }),

  // Stored as JSON string for multi-select; plain string for others
  value: text("value"),

  createdAt: timestamp("created_at").defaultNow(),
});

export type SelectResponse = typeof responsesTable.$inferSelect;
export type InsertResponse = typeof responsesTable.$inferInsert;

export type SelectResponseAnswer = typeof responseAnswersTable.$inferSelect;
export type InsertResponseAnswer = typeof responseAnswersTable.$inferInsert;
