import { httpLink, httpBatchStreamLink } from "@repo/trpc/client";
import { env } from "~/env.js";

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
    headers() {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("cf_token");
        if (token) {
          return { Authorization: `Bearer ${token}` };
        }
      }
      return {};
    },
    fetch(url, options) {
      return fetch(url, {
        ...options,
        credentials: "include",
      });
    },
  });
};
