import { z } from "zod";

import { defaultResponse } from "../default-response.js";
import { objectIdSchema } from "../object-id-schema.js";
import { userAccountExportPackageSchema } from "./get-user-recovery-package.js";

export const recoverUserAccountParamsSchema = z.object({
  userId: objectIdSchema,
});

export type RecoverUserAccountParams = z.infer<
  typeof recoverUserAccountParamsSchema
>;

export const recoverUserAccountBodySchema = z.object({
  recoveryPackage: userAccountExportPackageSchema,
});

export type RecoverUserAccountBody = z.infer<
  typeof recoverUserAccountBodySchema
>;

export const recoverUserAccountResponseSchemas = {
  200: z.object({
    data: z.object({
      relinked: z.object({
        bookmarks: z.int(),
        commentReactions: z.int(),
        comments: z.int(),
        toolReactions: z.int(),
        tools: z.int(),
      }),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
