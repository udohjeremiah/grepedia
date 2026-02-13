import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/@{$username}/add-tool/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      Lorem ipsum, dolor sit amet consectetur adipisicing elit. Dolor maxime et
      quas saepe incidunt officia possimus sapiente, sit dolorum excepturi ipsum
      inventore ab maiores sint facere. Corrupti laboriosam neque deserunt.
    </div>
  );
}
