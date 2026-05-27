import { db } from "@repo/database";
import {
  responsesTable,
  responseAnswersTable,
  formsTable,
  formFieldsTable,
} from "@repo/database/schema";
import { eq, desc, sql, and, count } from "@repo/database";

class ResponseService {
  async submitResponse(data: {
    formId: string;
    answers: Array<{ fieldId: string; value: string }>;
    respondentEmail?: string;
    respondentName?: string;
    ipAddress?: string;
    userAgent?: string;
    completionTime?: number;
  }) {
    const [response] = await db
      .insert(responsesTable)
      .values({
        formId: data.formId,
        respondentEmail: data.respondentEmail,
        respondentName: data.respondentName,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        completionTime: data.completionTime,
      })
      .returning();

    if (!response) throw new Error("Failed to save response");

    if (data.answers.length > 0) {
      await db.insert(responseAnswersTable).values(
        data.answers.map((a) => ({
          responseId: response.id,
          fieldId: a.fieldId,
          value: a.value,
        }))
      );
    }

    // Increment response count on the form
    await db
      .update(formsTable)
      .set({ responseCount: sql`${formsTable.responseCount} + 1` })
      .where(eq(formsTable.id, data.formId));

    return response;
  }

  async getResponsesByForm(
    formId: string,
    opts: { limit?: number; offset?: number } = {}
  ) {
    const { limit = 50, offset = 0 } = opts;
    return db
      .select()
      .from(responsesTable)
      .where(eq(responsesTable.formId, formId))
      .orderBy(desc(responsesTable.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getResponseCount(formId: string) {
    const [result] = await db
      .select({ count: count() })
      .from(responsesTable)
      .where(eq(responsesTable.formId, formId));
    return Number(result?.count ?? 0);
  }

  async getResponseWithAnswers(responseId: string) {
    const [response] = await db
      .select()
      .from(responsesTable)
      .where(eq(responsesTable.id, responseId))
      .limit(1);

    if (!response) return null;

    const answers = await db
      .select({
        id: responseAnswersTable.id,
        fieldId: responseAnswersTable.fieldId,
        value: responseAnswersTable.value,
        fieldLabel: formFieldsTable.label,
        fieldType: formFieldsTable.type,
      })
      .from(responseAnswersTable)
      .leftJoin(formFieldsTable, eq(responseAnswersTable.fieldId, formFieldsTable.id))
      .where(eq(responseAnswersTable.responseId, responseId));

    return { ...response, answers };
  }

  async getAllResponsesWithAnswers(formId: string) {
    const responses = await db
      .select()
      .from(responsesTable)
      .where(eq(responsesTable.formId, formId))
      .orderBy(desc(responsesTable.createdAt));

    const responsesWithAnswers = await Promise.all(
      responses.map(async (r) => {
        const answers = await db
          .select({
            id: responseAnswersTable.id,
            fieldId: responseAnswersTable.fieldId,
            value: responseAnswersTable.value,
            fieldLabel: formFieldsTable.label,
            fieldType: formFieldsTable.type,
          })
          .from(responseAnswersTable)
          .leftJoin(
            formFieldsTable,
            eq(responseAnswersTable.fieldId, formFieldsTable.id)
          )
          .where(eq(responseAnswersTable.responseId, r.id));

        return { ...r, answers };
      })
    );

    return responsesWithAnswers;
  }

  async getFormAnalytics(formId: string) {
    const totalResponses = await this.getResponseCount(formId);

    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(formFieldsTable.order);

    // For each field, calculate answer distributions
    const fieldAnalytics = await Promise.all(
      fields.map(async (field) => {
        const answers = await db
          .select({ value: responseAnswersTable.value })
          .from(responseAnswersTable)
          .where(eq(responseAnswersTable.fieldId, field.id));

        const distribution: Record<string, number> = {};
        let totalAnswered = 0;
        let numericSum = 0;
        let numericCount = 0;

        for (const a of answers) {
          if (!a.value) continue;
          totalAnswered++;

          if (field.type === "rating" || field.type === "number") {
            const num = parseFloat(a.value);
            if (!isNaN(num)) {
              numericSum += num;
              numericCount++;
            }
          }

          if (
            ["single_select", "multi_select", "checkbox", "dropdown"].includes(
              field.type
            )
          ) {
            try {
              const vals: string[] = JSON.parse(a.value);
              for (const v of vals) {
                distribution[v] = (distribution[v] ?? 0) + 1;
              }
            } catch {
              distribution[a.value] = (distribution[a.value] ?? 0) + 1;
            }
          }
        }

        return {
          fieldId: field.id,
          fieldLabel: field.label,
          fieldType: field.type,
          totalAnswered,
          answerRate:
            totalResponses > 0
              ? Math.round((totalAnswered / totalResponses) * 100)
              : 0,
          distribution,
          average:
            numericCount > 0
              ? Math.round((numericSum / numericCount) * 10) / 10
              : null,
        };
      })
    );

    // Response count per day (last 30 days)
    const dailyResponses = await db
      .select({
        date: sql<string>`DATE(${responsesTable.createdAt})::text`,
        count: count(),
      })
      .from(responsesTable)
      .where(
        and(
          eq(responsesTable.formId, formId),
          sql`${responsesTable.createdAt} >= NOW() - INTERVAL '30 days'`
        )
      )
      .groupBy(sql`DATE(${responsesTable.createdAt})`)
      .orderBy(sql`DATE(${responsesTable.createdAt})`);

    return {
      totalResponses,
      fieldAnalytics,
      dailyResponses,
    };
  }

  async deleteResponse(responseId: string) {
    await db.delete(responsesTable).where(eq(responsesTable.id, responseId));
  }

  async markAsRead(responseId: string) {
    const [updated] = await db
      .update(responsesTable)
      .set({ readAt: new Date() })
      .where(and(eq(responsesTable.id, responseId), sql`${responsesTable.readAt} IS NULL`))
      .returning();
    return updated;
  }

  async getUnreadCount(formId: string) {
    const [result] = await db
      .select({ count: count() })
      .from(responsesTable)
      .where(and(eq(responsesTable.formId, formId), sql`${responsesTable.readAt} IS NULL`));
    return Number(result?.count ?? 0);
  }
}

export default ResponseService;
