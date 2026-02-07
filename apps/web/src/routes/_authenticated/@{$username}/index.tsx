import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/@{$username}/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { username } = Route.useParams();

  return <main className="flex-1 p-4 sm:px-8 md:px-16">Hello {username}!</main>;
}
