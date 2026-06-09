import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";

import { EditList } from "./-components/edit-list";

export const Route = createFileRoute("/lists/$slug/edit/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Suspense>
      <EditList />
    </Suspense>
  );
}
