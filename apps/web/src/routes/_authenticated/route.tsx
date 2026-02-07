import { getAuthSession } from "@/utils/get-auth-session";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import Footer from "./-components/footer";
import Header from "./-components/header";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async () => {
    const authSession = await getAuthSession();
    if (!authSession) {
      throw redirect({ to: "/signin", replace: true });
    }
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
