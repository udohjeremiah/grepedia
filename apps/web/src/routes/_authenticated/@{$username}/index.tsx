import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/@{$username}/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { username } = Route.useParams();

  return <div>Hello {username}!</div>;
}
