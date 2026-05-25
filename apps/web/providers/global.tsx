"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import React, { useState, useEffect } from "react";
import { Toaster } from "~/components/ui/sonner";
import { AuthProvider } from "~/providers/auth";

import { trpc } from "~/trpc/client";
import { createTRPCHttpBatchClientClient } from "~/trpc/create-client";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: "always",
      staleTime: 0,
      retry: 1,
    },
  },
});

export const GlobalProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [createTRPCHttpBatchClientClient()],
    })
  );

  useEffect(() => {
    console.log(
      "%c🍵 ChaiForms",
      "font-size:28px;font-weight:900;color:#cc0000;font-family:Impact,sans-serif;letter-spacing:2px;"
    );
    console.log(
      "%c🧪 Dexter's Forms Lab — Build your experiments!",
      "font-size:13px;font-weight:bold;color:#1565c0;"
    );
    console.log(
      "%c⚡ Next.js 16  ·  tRPC v11  ·  Drizzle ORM  ·  PostgreSQL",
      "font-size:11px;color:#888;"
    );
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        enableSystem
        disableTransitionOnChange
      >
        <trpc.Provider queryClient={queryClient} client={trpcClient}>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </trpc.Provider>
      </NextThemesProvider>
    </QueryClientProvider>
  );
};
