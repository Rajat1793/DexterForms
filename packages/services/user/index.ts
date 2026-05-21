import { db } from "@repo/database";
import { usersTable } from "@repo/database/schema";
import { eq } from "@repo/database";
import { env } from "../env";
import { googleOAuth2Client } from "../clients/google-oauth";
import { hashPassword, comparePassword, signJWT } from "../auth";
import { GetAuthenticationMethodOutputSchema } from "./model";

class UserService {
  public async register(data: {
    fullName: string;
    email: string;
    password: string;
  }) {
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, data.email))
      .limit(1);

    if (existing.length > 0) {
      throw new Error("User with this email already exists");
    }

    const passwordHash = await hashPassword(data.password);

    const [user] = await db
      .insert(usersTable)
      .values({
        fullName: data.fullName,
        email: data.email,
        passwordHash,
        emailVerified: false,
      })
      .returning();

    if (!user) throw new Error("Failed to create user");

    const token = signJWT({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
    });

    return { user, token };
  }

  public async login(data: { email: string; password: string }) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, data.email))
      .limit(1);

    if (!user) throw new Error("Invalid email or password");
    if (!user.passwordHash) throw new Error("Please sign in with Google");

    const valid = await comparePassword(data.password, user.passwordHash);
    if (!valid) throw new Error("Invalid email or password");

    const token = signJWT({
      userId: user.id,
      email: user.email,
      fullName: user.fullName,
    });

    return { user, token };
  }

  public async getUserById(id: string) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id))
      .limit(1);
    return user ?? null;
  }

  public async getAuthenticationMethods(): Promise<
    ReadonlyArray<GetAuthenticationMethodOutputSchema>
  > {
    const supportedAuthenticationProviders: GetAuthenticationMethodOutputSchema[] = [];

    const isGoogleConfigured = !!(
      env.GOOGLE_OAUTH_CLIENT_ID &&
      env.GOOGLE_OAUTH_CLIENT_SECRET &&
      googleOAuth2Client
    );

    if (isGoogleConfigured && googleOAuth2Client) {
      const url = googleOAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["email", "profile"],
      });
      supportedAuthenticationProviders.push({
        provider: "GOOGLE_OAUTH",
        displayName: "Google",
        displayText: "Sign in with Google",
        authUrl: url,
      });
    }

    return supportedAuthenticationProviders;
  }
}

export default UserService;
