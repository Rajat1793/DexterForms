import { z, zodUndefinedModel } from "../../schema";
import { userService } from "../../services";
import { getAuthenticationMethodOutputSchema } from "@repo/services/user/model";
import { publicProcedure, protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { TRPCError } from "@trpc/server";

const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

export const authRouter = router({
  getSupportedAuthenticationProviders: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/supported-providers"),
        tags: TAGS,
      },
    })
    .input(zodUndefinedModel)
    .output(z.readonly(z.array(getAuthenticationMethodOutputSchema)))
    .query(async () => {
      return userService.getAuthenticationMethods();
    }),

  register: publicProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/register"), tags: TAGS },
    })
    .input(
      z.object({
        fullName: z.string().min(2).max(80),
        email: z.string().email(),
        password: z.string().min(8),
      })
    )
    .output(
      z.object({
        token: z.string(),
        user: z.object({
          id: z.string(),
          fullName: z.string(),
          email: z.string(),
          plan: z.string(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { user, token } = await userService.register(input);
        const isProd = process.env.NODE_ENV !== "development";
        ctx.res.cookie("df_token", token, {
          httpOnly: true,
          secure: isProd,
          sameSite: isProd ? "none" : "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/",
        });
        return {
          token,
          user: { id: user.id, fullName: user.fullName, email: user.email, plan: user.plan ?? "FREE" },
        };
      } catch (err) {
        throw new TRPCError({
          code: "CONFLICT",
          message: err instanceof Error ? err.message : "Registration failed",
        });
      }
    }),

  login: publicProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/login"), tags: TAGS },
    })
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      })
    )
    .output(
      z.object({
        token: z.string(),
        user: z.object({
          id: z.string(),
          fullName: z.string(),
          email: z.string(),
          plan: z.string(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { user, token } = await userService.login(input);
        const isProd = process.env.NODE_ENV !== "development";
        ctx.res.cookie("df_token", token, {
          httpOnly: true,
          secure: isProd,
          sameSite: isProd ? "none" : "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/",
        });
        return {
          token,
          user: { id: user.id, fullName: user.fullName, email: user.email, plan: user.plan ?? "FREE" },
        };
      } catch (err) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: err instanceof Error ? err.message : "Invalid credentials",
        });
      }
    }),

  me: protectedProcedure
    .meta({
      openapi: { method: "GET", path: getPath("/me"), tags: TAGS },
    })
    .input(zodUndefinedModel)
    .output(
      z.object({
        id: z.string(),
        fullName: z.string(),
        email: z.string(),
        plan: z.string(),
        profileImageUrl: z.string().nullable(),
        createdAt: z.date().nullable(),
      })
    )
    .query(async ({ ctx }) => {
      const user = await userService.getUserById(ctx.user.userId);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        plan: user.plan ?? "FREE",
        profileImageUrl: user.profileImageUrl ?? null,
        createdAt: user.createdAt ?? null,
      };
    }),

  updatePlan: protectedProcedure
    .meta({
      openapi: { method: "PATCH", path: getPath("/plan"), tags: TAGS },
    })
    .input(z.object({ plan: z.enum(["FREE", "PRO", "ENTERPRISE"]) }))
    .output(z.object({ plan: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await userService.updatePlan(ctx.user.userId, input.plan);
      return { plan: user.plan ?? "FREE" };
    }),

  requestPasswordReset: publicProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/forgot-password"), tags: TAGS },
    })
    .input(z.object({ email: z.string().email() }))
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input }) => {
      await userService.requestPasswordReset(input.email);
      // Always return success to avoid email enumeration
      return { success: true };
    }),

  resetPassword: publicProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/reset-password"), tags: TAGS },
    })
    .input(
      z.object({
        token: z.string().min(1),
        newPassword: z.string().min(8),
      })
    )
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ input }) => {
      try {
        await userService.resetPassword(input.token, input.newPassword);
        return { success: true };
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: err instanceof Error ? err.message : "Invalid or expired reset token",
        });
      }
    }),

  logout: publicProcedure
    .meta({
      openapi: { method: "POST", path: getPath("/logout"), tags: TAGS },
    })
    .input(zodUndefinedModel)
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx }) => {
      const isProd = process.env.NODE_ENV !== "development";
      ctx.res.clearCookie("df_token", { path: "/", secure: isProd, sameSite: isProd ? "none" : "lax" });
      return { success: true };
    }),
});
