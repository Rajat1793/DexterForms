import { z, zodUndefinedModel } from "../../schema";
import { formService, responseService, userService } from "../../services";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { TRPCError } from "@trpc/server";
import { sendNewResponseNotification } from "@repo/services/email";
import { comparePassword } from "@repo/services/auth";

const TAGS = ["Public"];
const getPath = generatePath("/public");

export const publicRouter = router({
  verifyFormPassword: publicProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/forms/{slug}/verify-password"), tags: TAGS },
    })
    .input(z.object({ slug: z.string(), password: z.string() }))
    .output(z.object({ valid: z.boolean() }))
    .mutation(async ({ input }) => {
      const form = await formService.getFormBySlug(input.slug);
      if (!form || !form.passwordHash) return { valid: false };
      const valid = await comparePassword(input.password, form.passwordHash);
      return { valid };
    }),

  getFormBySlug: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/forms/{slug}"),
        tags: TAGS,
      },
    })
    .input(z.object({ slug: z.string() }))
    .output(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().nullable(),
        slug: z.string().nullable(),
        themeId: z.string().nullable(),
        successMessage: z.string().nullable(),
        redirectUrl: z.string().nullable(),
        showProgressBar: z.boolean().nullable(),
        requiresPassword: z.boolean().nullable(),
        acceptingResponses: z.boolean().nullable(),
        fields: z.array(
          z.object({
            id: z.string(),
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
          })
        ),
      })
    )
    .query(async ({ input }) => {
      const form = await formService.getFormBySlug(input.slug);
      if (!form) throw new TRPCError({ code: "NOT_FOUND", message: "Form not found" });

      if (form.status !== "published") {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "This form is not published",
        });
      }

      if (!form.acceptingResponses) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This form is no longer accepting responses",
        });
      }

      if (form.expiresAt && new Date() > form.expiresAt) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This form has expired",
        });
      }

      if (
        form.maxResponses !== null &&
        form.maxResponses !== undefined &&
        (form.responseCount ?? 0) >= form.maxResponses
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This form has reached its maximum response limit",
        });
      }

      const fields = await formService.getFormFields(form.id);

      return {
        id: form.id,
        title: form.title,
        description: form.description ?? null,
        slug: form.slug ?? null,
        themeId: form.themeId ?? null,
        successMessage: form.successMessage ?? null,
        redirectUrl: form.redirectUrl ?? null,
        showProgressBar: form.showProgressBar ?? null,
        requiresPassword: form.requiresPassword ?? null,
        acceptingResponses: form.acceptingResponses ?? null,
        fields,
      };
    }),

  submitResponse: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/forms/{formId}/responses"),
        tags: TAGS,
      },
    })
    .input(
      z.object({
        formId: z.string(),
        answers: z.array(
          z.object({
            fieldId: z.string(),
            value: z.string(),
          })
        ),
        respondentEmail: z.string().email().optional(),
        respondentName: z.string().optional(),
        completionTime: z.number().optional(),
      })
    )
    .output(z.object({ responseId: z.string(), success: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const form = await formService.getFormById(input.formId);
      if (!form) throw new TRPCError({ code: "NOT_FOUND" });

      if (form.status !== "published" || !form.acceptingResponses) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "This form is not accepting responses",
        });
      }

      if (form.expiresAt && new Date() > form.expiresAt) {
        throw new TRPCError({ code: "FORBIDDEN", message: "This form has expired" });
      }

      if (
        form.maxResponses !== null &&
        form.maxResponses !== undefined &&
        (form.responseCount ?? 0) >= form.maxResponses
      ) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Response limit reached" });
      }

      const ipAddress =
        (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
        ctx.req.socket?.remoteAddress ??
        undefined;

      const response = await responseService.submitResponse({
        formId: input.formId,
        answers: input.answers,
        respondentEmail: input.respondentEmail,
        respondentName: input.respondentName,
        completionTime: input.completionTime,
        ipAddress,
        userAgent: ctx.req.headers["user-agent"],
      });

      // Send email notification to form creator if enabled
      if (form.notifyOnResponse) {
        const creator = await userService.getUserById(form.creatorId);
        if (creator) {
          sendNewResponseNotification({
            creatorEmail: creator.email,
            formTitle: form.title,
            formId: form.id,
            responseId: response.id,
          }).catch(() => {}); // fire-and-forget, don't fail submission
        }
      }

      return { responseId: response.id, success: true };
    }),
});
