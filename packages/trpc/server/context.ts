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

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      user = verifyJWT(token);
    } catch {
      user = null;
    }
  }

  return { user, req, res };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
