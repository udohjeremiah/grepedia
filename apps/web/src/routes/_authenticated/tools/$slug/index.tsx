import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/tools/$slug/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/tools/slug/"!</div>;
}
