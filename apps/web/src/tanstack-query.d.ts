import type { AxiosError } from "axios";

type Meta = Record<string, unknown>;

interface MutationMeta extends Meta {
  bannerId?: string;
}

interface QueryMeta extends Meta {
  bannerId?: string;
}

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: AxiosError;
    mutationMeta: MutationMeta;
    queryMeta: QueryMeta;
  }
}
