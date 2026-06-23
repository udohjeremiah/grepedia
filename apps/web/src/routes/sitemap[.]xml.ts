import { createFileRoute } from "@tanstack/react-router";
import { getListsResponseSchemas } from "@workspace/shared/schemas/lists/get-lists";
import {
  getToolSlugsQueryStringSchema,
  getToolSlugsResponseSchemas,
} from "@workspace/shared/schemas/tools/get-tool-slugs";

import { env } from "@/env";
import { apiClient } from "@/lib/api-client";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const staticPaths = [
          "/",
          "/leaderboard",
          "/lists",
          "/privacy-policy",
          "/search",
          "/terms-of-service",
          "/tools/directory",
        ];

        const tools: Array<{ slug: string }> = [];
        let cursor: string | undefined;

        do {
          const query = getToolSlugsQueryStringSchema.parse({
            cursor,
            limit: 1000,
          });

          const parsed = await apiClient
            .get("tools/slugs", { searchParams: query })
            .json(getToolSlugsResponseSchemas[200]);

          tools.push(...parsed.data.tools);
          cursor = parsed.data.nextCursor;
        } while (cursor);

        const lists = await apiClient
          .get("lists")
          .json(getListsResponseSchemas[200]);

        const staticUrls = staticPaths
          .map((path) => {
            const loc = `${env.VITE_BASE_URL}${path}`;
            return `<url><loc>${escapeXml(loc)}</loc></url>`;
          })
          .join("");

        const listUrls = lists.data.lists
          .map((list) => {
            const loc = `${env.VITE_BASE_URL}/lists/${list.slug}`;
            const lastmod = list.updatedAt
              ? `<lastmod>${list.updatedAt}</lastmod>`
              : "";

            return `<url><loc>${escapeXml(loc)}</loc>${lastmod}</url>`;
          })
          .join("");

        const toolUrls = tools
          .map((tool) => {
            const loc = `${env.VITE_BASE_URL}/tools/@${tool.slug}`;

            return `<url><loc>${escapeXml(loc)}</loc></url>`;
          })
          .join("");

        const sitemap =
          `<?xml version="1.0" encoding="UTF-8"?>` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
          staticUrls +
          listUrls +
          toolUrls +
          `</urlset>`;

        return new Response(sitemap, {
          headers: {
            "Cache-Control":
              "public, max-age=0, s-maxage=21600, stale-while-revalidate=86400",
            "Content-Type": "application/xml; charset=utf-8",
          },
        });
      },
    },
  },
});
