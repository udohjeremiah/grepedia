import { createFileRoute } from "@tanstack/react-router";
import SearchForm from "./-components/search-form";

export const Route = createFileRoute("/(search)/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center p-6 md:gap-6 md:p-10">
      <div className="flex flex-1 flex-col items-center justify-center gap-2 md:flex-initial">
        <img src="/favicon.svg" alt="Grepedia" width={64} height={64} />
        <h1 className="text-2xl font-bold">Grepedia</h1>
      </div>
      <SearchForm className="w-full" />
    </main>
  );
}
