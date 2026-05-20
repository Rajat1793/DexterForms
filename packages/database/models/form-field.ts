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
import { formsTable } from "./form";

export const formFieldsTable = pgTable("form_fields", {
  id: uuid("id").primaryKey().defaultRandom(),

  formId: uuid("form_id")
    .notNull()
    .references(() => formsTable.id, { onDelete: "cascade" }),

  // short_text | long_text | email | number | single_select |
  // multi_select | checkbox | rating | date | dropdown | phone | url
  type: varchar("type", { length: 50 }).notNull(),

  label: varchar("label", { length: 500 }).notNull(),
  placeholder: varchar("placeholder", { length: 500 }),
  description: text("description"),

  required: boolean("required").default(false),

  // Display order within the form
  order: integer("order").notNull().default(0),

  // For multi-page forms
  page: integer("page").default(1),

  // JSON: { min, max, minLength, maxLength, pattern, step }
  validations: jsonb("validations"),

  // JSON: [{ value: string, label: string }]
  options: jsonb("options"),

  // JSON: { minRating, maxRating } for rating fields
  settings: jsonb("settings"),

  // JSON: { showIf: [{ fieldId, operator, value }] }
  conditionalLogic: jsonb("conditional_logic"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type SelectFormField = typeof formFieldsTable.$inferSelect;
export type InsertFormField = typeof formFieldsTable.$inferInsert;
