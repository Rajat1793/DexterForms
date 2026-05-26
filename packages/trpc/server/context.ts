import { type Request, type Response } from "express";
import { verifyJWT, type JWTPayload } from "@repo/services/auth";

export async function createContext({
  req,
  res,
}: {
  req: Request;
  res: Response;
}) {
  let user: JWTPayload | null = null;

  // Prefer httpOnly cookie; fall back to Authorization header for backward compat
  const token =
    (req.cookies as Record<string, string | undefined>)?.df_token ??
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null);

  if (token) {
    try {
      user = verifyJWT(token);
    } catch {
      user = null;
    }
  }

  return { user, req, res };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
