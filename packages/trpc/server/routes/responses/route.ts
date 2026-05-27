import { z, zodUndefinedModel } from "../../schema";
import { formService, responseService } from "../../services";
import { protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { TRPCError } from "@trpc/server";

const TAGS = ["Responses"];
const getPath = generatePath("/forms");

const responseOutputSchema = z.object({
  id: z.string(),
  formId: z.string(),
  respondentEmail: z.string().nullable(),
  respondentName: z.string().nullable(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  completionTime: z.number().nullable(),
  metadata: z.any().nullable(),
  readAt: z.date().nullable(),
  createdAt: z.date().nullable(),
});

export const responsesRouter = router({
  getByForm: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/{formId}/responses"),
        tags: TAGS,
      },
    })
    .input(
      z.object({
        formId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .output(
      z.object({
        responses: z.array(responseOutputSchema),
        total: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const form = await formService.getFormById(input.formId, ctx.user.userId);
      if (!form) throw new TRPCError({ code: "NOT_FOUND" });

      const [responses, total] = await Promise.all([
        responseService.getResponsesByForm(input.formId, {
          limit: input.limit,
          offset: input.offset,
        }),
        responseService.getResponseCount(input.formId),
      ]);

      return { responses, total };
    }),

  getWithAnswers: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/{formId}/responses/{responseId}"),
        tags: TAGS,
      },
    })
    .input(z.object({ formId: z.string(), responseId: z.string() }))
    .output(z.any())
    .query(async ({ ctx, input }) => {
      const form = await formService.getFormById(input.formId, ctx.user.userId);
      if (!form) throw new TRPCError({ code: "NOT_FOUND" });

      const response = await responseService.getResponseWithAnswers(input.responseId);
      if (!response) throw new TRPCError({ code: "NOT_FOUND" });
      return response;
    }),

  getAllWithAnswers: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/{formId}/responses/export"),
        tags: TAGS,
      },
    })
    .input(z.object({ formId: z.string() }))
    .output(z.array(z.any()))
    .query(async ({ ctx, input }) => {
      const form = await formService.getFormById(input.formId, ctx.user.userId);
      if (!form) throw new TRPCError({ code: "NOT_FOUND" });
      return responseService.getAllResponsesWithAnswers(input.formId);
    }),

  delete: protectedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: getPath("/{formId}/responses/{responseId}"),
        tags: TAGS,
      },
    })
    .input(z.object({ formId: z.string(), responseId: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const form = await formService.getFormById(input.formId, ctx.user.userId);
      if (!form) throw new TRPCError({ code: "NOT_FOUND" });
      await responseService.deleteResponse(input.responseId);
      return { success: true };
    }),

  analytics: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/{formId}/analytics"),
        tags: TAGS,
      },
    })
    .input(z.object({ formId: z.string() }))
    .output(z.any())
    .query(async ({ ctx, input }) => {
      const form = await formService.getFormById(input.formId, ctx.user.userId);
      if (!form) throw new TRPCError({ code: "NOT_FOUND" });
      return responseService.getFormAnalytics(input.formId);
    }),

  markAsRead: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/{formId}/responses/{responseId}/read"),
        tags: TAGS,
      },
    })
    .input(z.object({ formId: z.string(), responseId: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const form = await formService.getFormById(input.formId, ctx.user.userId);
      if (!form) throw new TRPCError({ code: "NOT_FOUND" });
      await responseService.markAsRead(input.responseId);
      return { success: true };
    }),

  unreadCount: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/{formId}/responses/unread-count"),
        tags: TAGS,
      },
    })
    .input(z.object({ formId: z.string() }))
    .output(z.object({ count: z.number() }))
    .query(async ({ ctx, input }) => {
      const form = await formService.getFormById(input.formId, ctx.user.userId);
      if (!form) throw new TRPCError({ code: "NOT_FOUND" });
      const count = await responseService.getUnreadCount(input.formId);
      return { count };
    }),
});
