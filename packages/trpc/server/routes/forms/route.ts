import { z, zodUndefinedModel } from "../../schema";
import { formService } from "../../services";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { TRPCError } from "@trpc/server";

const TAGS = ["Forms"];
const getPath = generatePath("/forms");

const formOutputSchema = z.object({
  id: z.string(),
  creatorId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  slug: z.string().nullable(),
  status: z.string(),
  visibility: z.string(),
  themeId: z.string().nullable(),
  acceptingResponses: z.boolean().nullable(),
  maxResponses: z.number().nullable(),
  expiresAt: z.date().nullable(),
  requiresPassword: z.boolean().nullable(),
  successMessage: z.string().nullable(),
  redirectUrl: z.string().nullable(),
  showProgressBar: z.boolean().nullable(),
  isMultiPage: z.boolean().nullable(),
  totalPages: z.number().nullable(),
  responseCount: z.number().nullable(),
  notifyOnResponse: z.boolean().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export const formsRouter = router({
  create: protectedProcedure
    .meta({ openapi: { method: "POST", path: getPath(""), tags: TAGS } })
    .input(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().optional(),
      })
    )
    .output(formOutputSchema)
    .mutation(async ({ ctx, input }) => {
      return formService.createForm(ctx.user.userId, input);
    }),

  list: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath(""), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(z.array(formOutputSchema))
    .query(async ({ ctx }) => {
      return formService.getFormsByCreator(ctx.user.userId);
    }),

  getById: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/{id}"), tags: TAGS } })
    .input(z.object({ id: z.string() }))
    .output(formOutputSchema)
    .query(async ({ ctx, input }) => {
      const form = await formService.getFormById(input.id, ctx.user.userId);
      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      return form;
    }),

  update: protectedProcedure
    .meta({ openapi: { method: "PATCH", path: getPath("/{id}"), tags: TAGS } })
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().nullable().optional(),
        slug: z.string().min(3).max(100).optional(),
        visibility: z.enum(["public", "unlisted"]).optional(),
        themeId: z.string().optional(),
        acceptingResponses: z.boolean().optional(),
        maxResponses: z.number().nullable().optional(),
        successMessage: z.string().optional(),
        redirectUrl: z.string().nullable().optional(),
        showProgressBar: z.boolean().optional(),
        notifyOnResponse: z.boolean().optional(),
      })
    )
    .output(formOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const form = await formService.updateForm(id, ctx.user.userId, data as any);
      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      return form;
    }),

  publish: protectedProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/{id}/publish"), tags: TAGS },
    })
    .input(z.object({ id: z.string() }))
    .output(formOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const form = await formService.publishForm(input.id, ctx.user.userId);
      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      return form;
    }),

  unpublish: protectedProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/{id}/unpublish"), tags: TAGS },
    })
    .input(z.object({ id: z.string() }))
    .output(formOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const form = await formService.unpublishForm(input.id, ctx.user.userId);
      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      return form;
    }),

  close: protectedProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/{id}/close"), tags: TAGS },
    })
    .input(z.object({ id: z.string() }))
    .output(formOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const form = await formService.closeForm(input.id, ctx.user.userId);
      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      return form;
    }),

  delete: protectedProcedure
    .meta({
      openapi: { method: "DELETE", path: getPath("/{id}"), tags: TAGS },
    })
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await formService.deleteForm(input.id, ctx.user.userId);
      return { success: true };
    }),

  duplicate: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/{id}/duplicate"),
        tags: TAGS,
      },
    })
    .input(z.object({ id: z.string() }))
    .output(formOutputSchema)
    .mutation(async ({ ctx, input }) => {
      const form = await formService.duplicateForm(input.id, ctx.user.userId);
      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });
      return form;
    }),

  stats: protectedProcedure
    .meta({ openapi: { method: "GET", path: getPath("/stats/summary"), tags: TAGS } })
    .input(zodUndefinedModel)
    .output(
      z.object({
        totalForms: z.number(),
        publishedForms: z.number(),
        totalResponses: z.number(),
      })
    )
    .query(async ({ ctx }) => {
      return formService.getFormStats(ctx.user.userId);
    }),
});
