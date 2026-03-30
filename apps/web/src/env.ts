import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  client: {
    VITE_APPEAL_URL: z.url(),
    VITE_BASE_URL: z.url(),
    VITE_MODERATOR_REQUEST_URL: z.url(),
    VITE_REPORT_COMMENT_URL: z.url(),
    VITE_REPORT_TOOL_URL: z.url(),
    VITE_SERVER_API_URL: z.url(),
    VITE_SERVER_BASE_URL: z.url(),
    VITE_TOOL_UPDATE_URL: z.url(),
  },

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: "VITE_",

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,

  /**
   * Makes sure you explicitly access **all** environment variables
   * from `server` and `client` in your `runtimeEnv`.
   */
  runtimeEnvStrict: {
    VITE_APPEAL_URL: import.meta.env["VITE_APPEAL_URL"],
    VITE_BASE_URL: import.meta.env["VITE_BASE_URL"],
    VITE_MODERATOR_REQUEST_URL: import.meta.env["VITE_MODERATOR_REQUEST_URL"],
    VITE_REPORT_COMMENT_URL: import.meta.env["VITE_REPORT_COMMENT_URL"],
    VITE_REPORT_TOOL_URL: import.meta.env["VITE_REPORT_TOOL_URL"],
    VITE_SERVER_API_URL: import.meta.env["VITE_SERVER_API_URL"],
    VITE_SERVER_BASE_URL: import.meta.env["VITE_SERVER_BASE_URL"],
    VITE_TOOL_UPDATE_URL: import.meta.env["VITE_TOOL_UPDATE_URL"],
  },
});
