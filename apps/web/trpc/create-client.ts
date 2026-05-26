import { httpLink, httpBatchStreamLink } from "@repo/trpc/client";

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
      // Credentials: "include" sends the httpOnly df_token cookie automatically
      return fetch(url, {
        ...options,
        credentials: "include",
      });
    },
  });
};
