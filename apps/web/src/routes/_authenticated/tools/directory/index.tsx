import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/tools/directory/")({
  component: RouteComponent,
  head: () => ({
    meta: [
      { title: "Tool Directory — Grepedia" },
      {
        content:
          "Browse the full Grepedia tool directory and discover tools from around the world.",
        name: "description",
      },
    ],
  }),
});

function RouteComponent() {
  return <div>Hello /_authenticated/tools/directory/!</div>;
}
