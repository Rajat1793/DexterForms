// ─── Domain types ─────────────────────────────────────────────────────────────

export type Field = {
  id: string;
  formId: string;
  type: string;
  label: string;
  placeholder: string | null;
  description: string | null;
  required: boolean | null;
  order: number;
  page: number | null;
  validations: unknown;
  options: unknown;
  settings: unknown;
  conditionalLogic: unknown;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type ConditionalRule = { fieldId: string; operator: string; value: string };
export type ConditionalLogic = { showIf: ConditionalRule[] };

/** Mirrors the tRPC formOutputSchema so components stay decoupled from tRPC types. */
export type FormShape = {
  id: string;
  creatorId: string;
  title: string;
  description: string | null;
  slug: string | null;
  status: string;
  visibility: string;
  themeId: string | null;
  acceptingResponses: boolean | null;
  maxResponses: number | null;
  opensAt: Date | null;
  expiresAt: Date | null;
  requiresPassword: boolean | null;
  successMessage: string | null;
  redirectUrl: string | null;
  showProgressBar: boolean | null;
  isMultiPage: boolean | null;
  totalPages: number | null;
  responseCount: number | null;
  notifyOnResponse: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

/** Subset of fields that can be updated via forms.update. */
export type UpdateFormData = {
  title?: string;
  description?: string | null;
  slug?: string;
  visibility?: "public" | "unlisted";
  themeId?: string;
  acceptingResponses?: boolean;
  maxResponses?: number | null;
  successMessage?: string;
  redirectUrl?: string | null;
  showProgressBar?: boolean;
  notifyOnResponse?: boolean;
  requiresPassword?: boolean;
  password?: string;
  isMultiPage?: boolean;
  totalPages?: number;
  expiresAt?: Date | null;
  opensAt?: Date | null;
};

// ─── Constants ────────────────────────────────────────────────────────────────

export const FIELD_TYPES = [
  { type: "short_text",    label: "Short Text",    emoji: "📝", description: "Single line text" },
  { type: "long_text",     label: "Long Text",     emoji: "📄", description: "Multi-line text area" },
  { type: "email",         label: "Email",         emoji: "📧", description: "Email address" },
  { type: "number",        label: "Number",        emoji: "🔢", description: "Numeric input" },
  { type: "single_select", label: "Single Select", emoji: "🔘", description: "Pick one option" },
  { type: "multi_select",  label: "Multi Select",  emoji: "☑️",  description: "Pick multiple options" },
  { type: "checkbox",      label: "Checkbox",      emoji: "✅",  description: "Boolean yes/no" },
  { type: "rating",        label: "Rating",        emoji: "⭐",  description: "Star rating 1-5" },
  { type: "date",          label: "Date",          emoji: "📅",  description: "Date picker" },
  { type: "dropdown",      label: "Dropdown",      emoji: "📋",  description: "Select from dropdown" },
  { type: "phone",         label: "Phone",         emoji: "📞",  description: "Phone number" },
  { type: "url",           label: "URL",           emoji: "🔗",  description: "Website link" },
] as const;

export const THEMES = [
  { id: "dexter",    name: "Dexter's Lab",   emoji: "🧪", color: "#cc0000" },
  { id: "minimal",   name: "Minimal Purple", emoji: "🖥️", color: "#7c3aed" },
  { id: "dark",      name: "Dark Mode",      emoji: "🌑", color: "#1e1b4b" },
  { id: "matrix",    name: "Matrix",         emoji: "💻", color: "#166534" },
  { id: "sakura",    name: "Sakura",         emoji: "🌸", color: "#be185d" },
  { id: "cyberpunk", name: "Cyberpunk",      emoji: "⚡", color: "#3730a3" },
  { id: "ocean",     name: "Ocean",          emoji: "🌊", color: "#0369a1" },
  { id: "nebula",    name: "Nebula",         emoji: "🔮", color: "#581c87" },
  { id: "retro",     name: "Retro",          emoji: "🍺", color: "#c2410c" },
  { id: "dracula",   name: "Dracula",        emoji: "🦷", color: "#4c1d95" },
  { id: "naruto",    name: "Naruto",         emoji: "🍥", color: "#c2410c" },
  { id: "midnight",  name: "Midnight",       emoji: "🌙", color: "#1c1917" },
  { id: "startup",   name: "Startup",        emoji: "💰", color: "#065f46" },
] as const;

export const CONDITION_OPERATORS = [
  { value: "eq",           label: "equals" },
  { value: "neq",          label: "does not equal" },
  { value: "contains",     label: "contains" },
  { value: "is_empty",     label: "is empty" },
  { value: "is_not_empty", label: "is not empty" },
] as const;
