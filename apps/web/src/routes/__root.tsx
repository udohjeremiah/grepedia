import { GlobalBannerProvider } from "@/providers/global-banner-provider";
import { TanStackQueryProvider } from "@/providers/tanstack-query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import appCss from "@/styles/globals.css?url";
import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack";
import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { ReactNode } from "react";

export interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title:
          "Grepedia — the encyclopedia of tools powered by collective wisdom",
      },
      {
        name: "description",
        content:
          "Grepedia — the encyclopedia of tools powered by collective wisdom. Search and explore tools curated by the community.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
  const { queryClient } = Route.useRouteContext();

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <TanStackQueryProvider queryClient={queryClient}>
          <AuthQueryProvider>
            <ThemeProvider>
              <GlobalBannerProvider>{children}</GlobalBannerProvider>
            </ThemeProvider>
          </AuthQueryProvider>
        </TanStackQueryProvider>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            {
              name: "Tanstack Query",
              render: <ReactQueryDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
