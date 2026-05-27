import { db } from "@repo/database";
import { formsTable, formFieldsTable } from "@repo/database/schema";
import { eq, and, ne, or, ilike, desc, count, sql } from "@repo/database";
import { InsertForm, InsertFormField } from "@repo/database/schema";
import { hashPassword } from "../auth";

function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 50) +
    "-" +
    Math.random().toString(36).slice(2, 7)
  );
}

class FormService {
  async createForm(creatorId: string, data: { title: string; description?: string }) {
    const slug = generateSlug(data.title);
    const [form] = await db
      .insert(formsTable)
      .values({
        creatorId,
        title: data.title,
        description: data.description ?? null,
        slug,
        status: "draft",
        visibility: "public",
      })
      .returning();
    return form!;
  }

  async getPublicForms(search?: string) {
    const baseCondition = and(
      eq(formsTable.status, "published"),
      eq(formsTable.visibility, "public")
    );
    const condition = search?.trim()
      ? and(baseCondition, ilike(formsTable.title, `%${search.trim()}%`))
      : baseCondition;
    return db
      .select()
      .from(formsTable)
      .where(condition)
      .orderBy(desc(formsTable.responseCount), desc(formsTable.createdAt))
      .limit(60);
  }

  async getFormsByCreator(creatorId: string) {
    return db
      .select()
      .from(formsTable)
      .where(eq(formsTable.creatorId, creatorId))
      .orderBy(desc(formsTable.createdAt));
  }

  async getFormById(id: string, creatorId?: string) {
    const conditions = creatorId
      ? and(eq(formsTable.id, id), eq(formsTable.creatorId, creatorId))
      : eq(formsTable.id, id);

    const [form] = await db
      .select()
      .from(formsTable)
      .where(conditions)
      .limit(1);
    return form ?? null;
  }

  async getFormBySlug(slug: string) {
    const [form] = await db
      .select()
      .from(formsTable)
      .where(eq(formsTable.slug, slug))
      .limit(1);
    return form ?? null;
  }

  async updateForm(id: string, creatorId: string, data: Partial<InsertForm>, plainPassword?: string) {
    const updateData: Partial<InsertForm> = { ...data };
    if (plainPassword !== undefined) {
      if (plainPassword) {
        updateData.passwordHash = await hashPassword(plainPassword);
      } else {
        updateData.passwordHash = null;
      }
    }
    const [form] = await db
      .update(formsTable)
      .set(updateData)
      .where(and(eq(formsTable.id, id), eq(formsTable.creatorId, creatorId)))
      .returning();
    return form ?? null;
  }

  async archiveForm(id: string, creatorId: string) {
    const [form] = await db
      .update(formsTable)
      .set({ status: "archived" })
      .where(and(eq(formsTable.id, id), eq(formsTable.creatorId, creatorId)))
      .returning();
    return form ?? null;
  }

  async unarchiveForm(id: string, creatorId: string) {
    const [form] = await db
      .update(formsTable)
      .set({ status: "draft" })
      .where(and(eq(formsTable.id, id), eq(formsTable.creatorId, creatorId)))
      .returning();
    return form ?? null;
  }

  async publishForm(id: string, creatorId: string) {
    const [form] = await db
      .update(formsTable)
      .set({ status: "published", acceptingResponses: true })
      .where(and(eq(formsTable.id, id), eq(formsTable.creatorId, creatorId)))
      .returning();
    return form ?? null;
  }

  async unpublishForm(id: string, creatorId: string) {
    const [form] = await db
      .update(formsTable)
      .set({ status: "draft" })
      .where(and(eq(formsTable.id, id), eq(formsTable.creatorId, creatorId)))
      .returning();
    return form ?? null;
  }

  async closeForm(id: string, creatorId: string) {
    const [form] = await db
      .update(formsTable)
      .set({ status: "closed", acceptingResponses: false })
      .where(and(eq(formsTable.id, id), eq(formsTable.creatorId, creatorId)))
      .returning();
    return form ?? null;
  }

  async deleteForm(id: string, creatorId: string) {
    await db
      .delete(formsTable)
      .where(and(eq(formsTable.id, id), eq(formsTable.creatorId, creatorId)));
  }

  async duplicateForm(id: string, creatorId: string) {
    const original = await this.getFormById(id, creatorId);
    if (!original) return null;

    const fields = await this.getFormFields(id);

    const slug = generateSlug(original.title + " copy");
    const [newForm] = await db
      .insert(formsTable)
      .values({
        creatorId,
        title: original.title + " (Copy)",
        description: original.description,
        slug,
        status: "draft",
        visibility: original.visibility,
        themeId: original.themeId,
        successMessage: original.successMessage,
        showProgressBar: original.showProgressBar,
      })
      .returning();

    if (!newForm) return null;

    if (fields.length > 0) {
      await db.insert(formFieldsTable).values(
        fields.map((f) => ({
          formId: newForm.id,
          type: f.type,
          label: f.label,
          placeholder: f.placeholder,
          description: f.description,
          required: f.required,
          order: f.order,
          page: f.page,
          validations: f.validations,
          options: f.options,
          settings: f.settings,
        }))
      );
    }

    return newForm;
  }

  // ─── Fields ──────────────────────────────────────────────────────────────

  async getFormFields(formId: string) {
    return db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(formFieldsTable.order);
  }

  async addField(formId: string, data: Omit<InsertFormField, "formId">) {
    const [field] = await db
      .insert(formFieldsTable)
      .values({ ...data, formId })
      .returning();
    return field!;
  }

  async updateField(fieldId: string, formId: string, data: Partial<InsertFormField>) {
    const [field] = await db
      .update(formFieldsTable)
      .set({ ...data })
      .where(and(eq(formFieldsTable.id, fieldId), eq(formFieldsTable.formId, formId)))
      .returning();
    return field ?? null;
  }

  async deleteField(fieldId: string, formId: string) {
    await db
      .delete(formFieldsTable)
      .where(and(eq(formFieldsTable.id, fieldId), eq(formFieldsTable.formId, formId)));
  }

  async reorderFields(formId: string, orderedIds: string[]) {
    await Promise.all(
      orderedIds.map((fieldId, idx) =>
        db
          .update(formFieldsTable)
          .set({ order: idx })
          .where(and(eq(formFieldsTable.id, fieldId), eq(formFieldsTable.formId, formId)))
      )
    );
  }

  async getFormStats(creatorId: string) {
    const forms = await db
      .select({ count: count() })
      .from(formsTable)
      .where(and(eq(formsTable.creatorId, creatorId), ne(formsTable.status, "archived")));

    const published = await db
      .select({ count: count() })
      .from(formsTable)
      .where(
        and(eq(formsTable.creatorId, creatorId), eq(formsTable.status, "published"))
      );

    const totalResponses = await db
      .select({ total: sql<number>`sum(${formsTable.responseCount})` })
      .from(formsTable)
      .where(and(eq(formsTable.creatorId, creatorId), ne(formsTable.status, "archived")));

    return {
      totalForms: Number(forms[0]?.count ?? 0),
      publishedForms: Number(published[0]?.count ?? 0),
      totalResponses: Number(totalResponses[0]?.total ?? 0),
    };
  }
}

export default FormService;
