import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/leaderboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_authenticated/tools/leaderboard/"!</div>;
}
