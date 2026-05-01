import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import AppLayout from "@/components/app-layout";
import { getSession } from "@/utils/get-session";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) throw redirect({ replace: true, to: "/signin" });

    const userId = session.user.id;
    return { userId };
  },
  component: LayoutComponent,
});

function LayoutComponent() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
