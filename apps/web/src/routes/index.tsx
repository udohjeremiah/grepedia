import { createFileRoute } from "@tanstack/react-router";

import SearchForm from "./-components/search-form";

export const Route = createFileRoute("/")({ component: RouteComponent });

function RouteComponent() {
  return (
    <main className="flex min-h-svh flex-col items-center p-6 md:p-10">
      <div className="flex w-full max-w-2xl flex-1 flex-col justify-center md:gap-6">
        <div className="flex flex-1 items-center justify-center md:flex-initial">
          <h2 className="text-center text-2xl font-bold tracking-tight text-pretty">
            Describe what you are looking for
          </h2>
        </div>
        <SearchForm />
      </div>
    </main>
  );
}
