import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { List } from "./-components/list";
import { listQueryOptions } from "./-queries/list";

export const Route = createFileRoute("/lists/$slug/")({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    const {
      data: { list },
    } = await context.queryClient.ensureQueryData(
      listQueryOptions({ slug: params.slug }),
    );

    return { list };
  },
  // eslint-disable-next-line perfectionist/sort-objects
  head: ({ loaderData }) => {
    const list = loaderData?.list;

    const title = `${list?.title ?? "Curated List"} • Grepedia`;
    const description =
      list?.description ?? "Explore this curated tool list on Grepedia.";

    return {
      meta: [{ title }, { content: description, name: "description" }],
    };
  },
});

function RouteComponent() {
  return (
    <Suspense>
      <List />
    </Suspense>
  );
}
