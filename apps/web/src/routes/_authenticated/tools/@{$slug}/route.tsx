import { createFileRoute, Outlet } from "@tanstack/react-router";

import ToolHeader from "./-components/tool-header";
import ToolSidebar from "./-components/tool-sidebar";
import { toolQueryOptions } from "./-queries/tool";

export const Route = createFileRoute("/_authenticated/tools/@{$slug}")({
  component: LayoutComponent,
  loader: ({ context, params }) => {
    context.queryClient.prefetchQuery(toolQueryOptions({ slug: params.slug }));
  },
  // eslint-disable-next-line perfectionist/sort-objects
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Tool Details | Grepedia` },
      {
        content: `Explore tool details, proposals, and community debate for ${params.slug} on Grepedia.`,
        name: "description",
      },
    ],
  }),
});

function LayoutComponent() {
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
