import { createFileRoute, Outlet } from "@tanstack/react-router";

import { env } from "@/env";
import { useFavicon } from "@/hooks/use-favicon";

import { ToolHeader } from "./-components/tool-header";
import { ToolSidebar } from "./-components/tool-sidebar";
import { toolQueryOptions } from "./-queries/tool";

export const Route = createFileRoute("/tools/@{$slug}")({
  component: LayoutComponent,
  loader: async ({ context, params }) => {
    const {
      data: { tool },
    } = await context.queryClient.ensureQueryData(
      toolQueryOptions({ slug: params.slug }),
    );

    return { tool };
  },
  // eslint-disable-next-line perfectionist/sort-objects
  head: ({ loaderData, params }) => {
    const tool = loaderData?.tool;

    const ogImage = new URL(`/tools/@${params.slug}/og`, env.VITE_BASE_URL);

    if (tool) {
      ogImage.searchParams.set("name", tool.name);
      ogImage.searchParams.set("officialUrl", tool.officialUrl);
      ogImage.searchParams.set("description", tool.shortDescription);
      ogImage.searchParams.set("categories", tool.categories.join(","));
      ogImage.searchParams.set("upvotes", String(tool.stats.upvotes));
      ogImage.searchParams.set("downvotes", String(tool.stats.downvotes));
    }

    const title = `${tool?.name ?? params.slug} • Grepedia`;
    const description =
      tool?.shortDescription ??
      `Explore tool details for ${params.slug} on Grepedia.`;

    return {
      meta: [
        { title },
        { content: description, name: "description" },
        { content: title, property: "og:title" },
        { content: description, property: "og:description" },
        { content: ogImage.toString(), property: "og:image" },
        { content: "website", property: "og:type" },
        { content: "summary_large_image", name: "twitter:card" },
        { content: title, name: "twitter:title" },
        { content: description, name: "twitter:description" },
        { content: ogImage.toString(), name: "twitter:image" },
      ],
    };
  },
});

function LayoutComponent() {
  const { tool } = Route.useLoaderData();
  useFavicon(tool.officialUrl);

  return (
    <main className="flex flex-1 p-4 sm:px-8 md:px-16">
      <div className="flex flex-1 flex-col gap-8">
        <ToolHeader />
        <div className="grid grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_25%] lg:grid-rows-none lg:gap-8">
          <div className="lg:order-2">
            <ToolSidebar />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <Outlet />
          </div>
        </div>
      </div>
    </main>
  );
}
