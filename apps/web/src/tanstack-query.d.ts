// eslint-disable-next-line depend/ban-dependencies
import type { AxiosError } from "axios";

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: AxiosError;
  }
}
