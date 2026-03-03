import type { QueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { AuthQueryProvider } from "@daveyplate/better-auth-tanstack";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TooltipProvider } from "@workspace/ui/components/tooltip";

import { GlobalBannerProvider } from "@/providers/global-banner-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import appCss from "@/styles/globals.css?url";

export interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    links: [
      {
        href: appCss,
        rel: "stylesheet",
      },
    ],
    meta: [
      {
        charSet: "utf8",
      },
      {
        content: "width=device-width, initial-scale=1",
        name: "viewport",
      },
      {
        title:
          "Grepedia — the encyclopedia of tools powered by collective wisdom",
      },
      {
        content:
          "Grepedia — the encyclopedia of tools powered by collective wisdom. Search and explore tools curated by the community.",
        name: "description",
      },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <HeadContent />
      </head>
      <body>
        <AuthQueryProvider>
          <ThemeProvider>
            <TooltipProvider>
              <GlobalBannerProvider>{children}</GlobalBannerProvider>
            </TooltipProvider>
          </ThemeProvider>
        </AuthQueryProvider>
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
