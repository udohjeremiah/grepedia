import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/@{$username}/add-tool/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/@$username/add-tool/"!</div>;
}
