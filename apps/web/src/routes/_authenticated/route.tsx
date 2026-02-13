import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { getSession } from "@/utils/get-session";

import Footer from "./-components/footer";
import Header from "./-components/header";

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
    <div className="flex min-h-svh flex-col">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
