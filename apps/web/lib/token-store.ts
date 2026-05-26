/**
 * Module-level token store.
 *
 * Persists the JWT to sessionStorage so it survives page reloads within the
 * same tab, but is automatically cleared when the tab/browser is closed.
 * The token is also sent as an Authorization header by the tRPC client,
 * which avoids cross-origin SameSite/third-party cookie restrictions.
 */
const SESSION_KEY = "df_session";

export const tokenStore = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(SESSION_KEY);
  },
  set(token: string | null): void {
    if (typeof window === "undefined") return;
    if (token) {
      sessionStorage.setItem(SESSION_KEY, token);
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  },
};
