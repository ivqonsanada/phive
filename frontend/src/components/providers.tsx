"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useState, type ReactNode } from "react";

import type { RuntimeConfig } from "@/lib/runtime-config";

const ConfigContext = createContext<RuntimeConfig | null>(null);

export function useRuntimeConfig(): RuntimeConfig {
  const config = useContext(ConfigContext);

  if (!config) {
    throw new Error("useRuntimeConfig must be used inside <Providers>.");
  }

  return config;
}

export function Providers({ config, children }: { config: RuntimeConfig; children: ReactNode }) {
  // Created inside state, not at module scope: on the server a module-level client
  // would be shared between concurrent requests, leaking one visitor's cached data
  // into another's render.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            // The public endpoints are stable enough that refetching on every window
            // focus is noise, and it is a wasted round trip on a phone.
            refetchOnWindowFocus: false,
            // A retry here delays the fixture fallback by seconds for every visitor
            // when the backend is simply down. Failing fast is the better trade.
            retry: 1,
          },
        },
      }),
  );

  return (
    <ConfigContext.Provider value={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ConfigContext.Provider>
  );
}
