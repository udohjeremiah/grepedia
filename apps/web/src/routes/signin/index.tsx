import { createFileRoute } from "@tanstack/react-router";
import SigninForm from "./-components/signin-form";

export const Route = createFileRoute("/signin/")({ component: RouteComponent });

function RouteComponent() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SigninForm />
      </div>
    </main>
  );
}
