import { createFileRoute, Outlet } from "@tanstack/react-router";

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

    if (!tool) {
      return {
        meta: [
          { title: `${params.slug} • Tool Details • Grepedia` },
          {
            content: `Explore tool details, proposals, and community debate for ${params.slug} on Grepedia.`,
            name: "description",
          },
        ],
      };
    }

    return {
      meta: [
        { title: `${tool.name} • Grepedia` },
        { content: tool.shortDescription, name: "description" },
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
