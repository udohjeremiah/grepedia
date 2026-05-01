import { createFileRoute, Outlet } from "@tanstack/react-router";

import AppLayout from "@/components/app-layout";

export const Route = createFileRoute("/tools")({
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
