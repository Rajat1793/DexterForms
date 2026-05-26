import { httpLink, httpBatchStreamLink } from "@repo/trpc/client";
import { tokenStore } from "~/lib/token-store";

const API_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/trpc")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/trpc");

interface CreateTRPCHttpBatchClientClientOpts {
  enableStreaming?: boolean;
}

export const createTRPCHttpBatchClientClient = (
  opts?: CreateTRPCHttpBatchClientClientOpts
) => {
  const c = opts?.enableStreaming ? httpBatchStreamLink : httpLink;
  return c({
    url: API_URL,
    fetch(url, options) {
      // Send cookie (httpOnly df_token) AND Authorization header as a fallback.
      // The header is needed when cross-origin SameSite/third-party cookie restrictions
      // prevent the browser from sending the cookie automatically.
      const token = tokenStore.get();
      return fetch(url, {
        ...options,
        credentials: "include",
        headers: {
          ...(options?.headers as Record<string, string> | undefined),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    },
  });
};
