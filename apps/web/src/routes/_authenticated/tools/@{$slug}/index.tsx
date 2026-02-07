import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/tools/@{$slug}/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { slug } = Route.useParams();

  return <div>{slug}</div>;
}
