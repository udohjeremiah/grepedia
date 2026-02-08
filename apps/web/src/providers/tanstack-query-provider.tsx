import type { ReactNode } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { tanstackQueryClient } from "@/lib/tanstack-query-client";

interface TanStackQueryProviderProps {
  children: ReactNode;
  queryClient: QueryClient;
}

export function getContext() {
  const queryClient = tanstackQueryClient();
  return { queryClient };
}

export function TanStackQueryProvider({
  children,
  queryClient,
}: TanStackQueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
