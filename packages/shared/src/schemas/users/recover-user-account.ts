import { z } from "zod";

import { defaultResponse } from "../default-response.js";
import { userAccountExportPackageSchema } from "./get-user-recovery-package.js";

export const recoverUserAccountParamsSchema = z.object({
  userId: z.string(),
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
        bookmarks: z.int().min(0),
        commentReactions: z.int().min(0),
        comments: z.int().min(0),
        toolReactions: z.int().min(0),
        tools: z.int().min(0),
      }),
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
