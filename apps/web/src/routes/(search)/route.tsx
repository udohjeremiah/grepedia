import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(search)")({
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <div className="flex min-h-svh flex-col">
      <Outlet />
    </div>
  );
}
