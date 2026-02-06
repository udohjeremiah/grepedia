import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(auth)")({
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <Outlet />
    </div>
  );
}
