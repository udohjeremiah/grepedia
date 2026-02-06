import { tanstackQueryClient } from "@/lib/tanstack-query-client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

export function getContext() {
  const queryClient = tanstackQueryClient();
  return { queryClient };
}

interface TanStackQueryProviderProps {
  queryClient: QueryClient;
  children: ReactNode;
}

export function TanStackQueryProvider({
  children,
  queryClient,
}: TanStackQueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
