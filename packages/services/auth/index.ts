import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { env } from "../env";

export interface JWTPayload {
  userId: string;
  email: string;
  fullName: string;
}

export function signJWT(payload: JWTPayload): string {
  return jwt.sign(payload as object, env.JWT_SECRET, {
    expiresIn: (env.JWT_EXPIRES_IN ?? "7d") as jwt.SignOptions["expiresIn"],
  });
}

export function verifyJWT(token: string): JWTPayload {
  return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
