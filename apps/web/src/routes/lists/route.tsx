import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AppLayout } from "@/components/app-layout";

export const Route = createFileRoute("/lists")({
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
