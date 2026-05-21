import { OAuth2Client } from "google-auth-library";
import { env } from "../env";

// Only create the OAuth client if credentials are configured
export const googleOAuth2Client = (env.GOOGLE_OAUTH_CLIENT_ID && env.GOOGLE_OAUTH_CLIENT_SECRET)
  ? new OAuth2Client({
      client_id: env.GOOGLE_OAUTH_CLIENT_ID,
      client_secret: env.GOOGLE_OAUTH_CLIENT_SECRET,
      redirectUri: env.GOOGLE_OAUTH_REDIRECT_URI,
    })
  : null;
