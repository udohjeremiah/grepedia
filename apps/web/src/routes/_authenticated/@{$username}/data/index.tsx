import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/@{$username}/data/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <main className="p-4 sm:px-8 md:px-0 md:py-6"></main>;
}
