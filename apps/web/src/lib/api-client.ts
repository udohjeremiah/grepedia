import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import ky, { isHTTPError } from "ky";

import { env } from "@/env";

const getCookie = createIsomorphicFn()
  .server(() => getRequestHeaders().get("cookie") ?? undefined)
  .client(() => {});

export const apiClient = ky.create({
  baseUrl: env.VITE_API_BASE_URL,
  credentials: "include",
  hooks: {
    beforeError: [
      ({ error }) => {
        if (
          isHTTPError(error) &&
          typeof error.data === "object" &&
          error.data !== null &&
          "message" in error.data &&
          typeof error.data.message === "string"
        ) {
          error.message = error.data.message;
        }
        return error;
      },
    ],
    beforeRequest: [
      ({ request }) => {
        const cookie = getCookie();
        if (cookie) {
          request.headers.set("cookie", cookie);
        }
      },
    ],
  },
});
