import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

export function getContext() {
  const queryClient = new QueryClient();
  return { queryClient };
}

interface TanStackQueryProviderProps {
  children: ReactNode;
  queryClient: QueryClient;
}

export function TanStackQueryProvider({
  children,
  queryClient,
}: TanStackQueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
