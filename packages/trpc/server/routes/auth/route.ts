import { z, zodUndefinedModel } from "../../schema";
import { userService } from "../../services";
import { getAuthenticationMethodOutputSchema } from "@repo/services/user/model";
import { publicProcedure, protectedProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";

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
        }),
      })
    )
    .mutation(async ({ input }) => {
      const { user, token } = await userService.register(input);
      return {
        token,
        user: { id: user.id, fullName: user.fullName, email: user.email },
      };
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
        }),
      })
    )
    .mutation(async ({ input }) => {
      const { user, token } = await userService.login(input);
      return {
        token,
        user: { id: user.id, fullName: user.fullName, email: user.email },
      };
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
        profileImageUrl: z.string().nullable(),
        createdAt: z.date().nullable(),
      })
    )
    .query(async ({ ctx }) => {
      const user = await userService.getUserById(ctx.user.userId);
      if (!user) throw new Error("User not found");
      return {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        profileImageUrl: user.profileImageUrl ?? null,
        createdAt: user.createdAt ?? null,
      };
    }),
});
