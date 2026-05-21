import { createFileRoute } from "@tanstack/react-router";
import { ImageResponse } from "takumi-js/response";

import { OgCard } from "@/components/og-card";
import stylesheet from "@/styles/globals.css?inline";

export const Route = createFileRoute("/tools/@{$slug}/og-image")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);

        const tool = {
          categories: url.searchParams.get("categories")?.split(",") ?? [],
          name: url.searchParams.get("name") ?? "",
          officialUrl: url.searchParams.get("officialUrl") ?? "",
          shortDescription: url.searchParams.get("description") ?? "",
          stats: {
            comments: Number(url.searchParams.get("comments") ?? 0),
            upvotes: Number(url.searchParams.get("upvotes") ?? 0),
          },
        };

        const favicon = `https://www.google.com/s2/favicons?domain=${tool.officialUrl}&sz=128`;

        let primary = "#7c3aed";
        let secondary = "#a78bfa";

        try {
          const { Vibrant } = await import("node-vibrant/node");
          const palette = await Vibrant.from(favicon).getPalette();
          primary = palette.Vibrant?.hex ?? primary;
          secondary = palette.DarkVibrant?.hex ?? secondary;
        } catch {
          /* empty */
        }

        return new ImageResponse(
          <OgCard
            favicon={favicon}
            primary={primary}
            secondary={secondary}
            tool={tool}
          />,
          {
            headers: {
              "Cache-Control":
                "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
              "Content-Type": "image/png",
            },
            height: 630,
            stylesheets: [stylesheet],
            width: 1200,
          },
        );
      },
    },
  },
});
