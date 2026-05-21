import { z } from "../../schema";
import { formService } from "../../services";
import { protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { TRPCError } from "@trpc/server";

const TAGS = ["Form Fields"];
const getPath = generatePath("/forms");

const fieldOutputSchema = z.object({
  id: z.string(),
  formId: z.string(),
  type: z.string(),
  label: z.string(),
  placeholder: z.string().nullable(),
  description: z.string().nullable(),
  required: z.boolean().nullable(),
  order: z.number(),
  page: z.number().nullable(),
  validations: z.any().nullable(),
  options: z.any().nullable(),
  settings: z.any().nullable(),
  conditionalLogic: z.any().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export const fieldsRouter = router({
  getByForm: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/{formId}/fields"),
        tags: TAGS,
      },
    })
    .input(z.object({ formId: z.string() }))
    .output(z.array(fieldOutputSchema))
    .query(async ({ ctx, input }) => {
      const form = await formService.getFormById(input.formId, ctx.user.userId);
      if (!form) throw new TRPCError({ code: "NOT_FOUND" });
      return formService.getFormFields(input.formId);
    }),

  add: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/{formId}/fields"),
        tags: TAGS,
      },
    })
    .input(
      z.object({
        formId: z.string(),
        type: z.enum([
          "short_text",
          "long_text",
          "email",
          "number",
          "single_select",
          "multi_select",
          "checkbox",
          "rating",
          "date",
          "dropdown",
          "phone",
          "url",
        ]),
        label: z.string().min(1).max(500),
        placeholder: z.string().optional(),
        description: z.string().optional(),
        required: z.boolean().optional().default(false),
        order: z.number().optional().default(0),
        page: z.number().optional().default(1),
        validations: z.any().optional(),
        options: z.any().optional(),
        settings: z.any().optional(),
        conditionalLogic: z.any().optional(),
      })
    )
    .output(fieldOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const form = await formService.getFormById(input.formId, ctx.user.userId);
      if (!form) throw new TRPCError({ code: "NOT_FOUND" });
      const { formId, ...fieldData } = input;
      return formService.addField(formId, fieldData as any);
    }),

  update: protectedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: getPath("/{formId}/fields/{fieldId}"),
        tags: TAGS,
      },
    })
    .input(
      z.object({
        formId: z.string(),
        fieldId: z.string(),
        label: z.string().min(1).max(500).optional(),
        placeholder: z.string().nullable().optional(),
        description: z.string().nullable().optional(),
        required: z.boolean().optional(),
        order: z.number().optional(),
        validations: z.any().optional(),
        options: z.any().optional(),
        settings: z.any().optional(),
        conditionalLogic: z.any().optional(),
      })
    )
    .output(fieldOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const form = await formService.getFormById(input.formId, ctx.user.userId);
      if (!form) throw new TRPCError({ code: "NOT_FOUND" });
      const { formId, fieldId, ...data } = input;
      const field = await formService.updateField(fieldId, formId, data as any);
      if (!field) throw new TRPCError({ code: "NOT_FOUND" });
      return field;
    }),

  delete: protectedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: getPath("/{formId}/fields/{fieldId}"),
        tags: TAGS,
      },
    })
    .input(z.object({ formId: z.string(), fieldId: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const form = await formService.getFormById(input.formId, ctx.user.userId);
      if (!form) throw new TRPCError({ code: "NOT_FOUND" });
      await formService.deleteField(input.fieldId, input.formId);
      return { success: true };
    }),

  reorder: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/{formId}/fields/reorder"),
        tags: TAGS,
      },
    })
    .input(
      z.object({
        formId: z.string(),
        orderedIds: z.array(z.string()),
      })
    )
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const form = await formService.getFormById(input.formId, ctx.user.userId);
      if (!form) throw new TRPCError({ code: "NOT_FOUND" });
      await formService.reorderFields(input.formId, input.orderedIds);
      return { success: true };
    }),
});
