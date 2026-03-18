import { z } from "zod";

import { defaultResponse } from "@/schemas/default-response.js";
import { objectIdSchema } from "@/schemas/object-id.js";

import { userRecoveryPackageSchema } from "./user-recovery-package.js";

export const getUserRecoveryPackageParamsSchema = z.object({
  userId: objectIdSchema,
});

export type GetUserRecoveryPackageParams = z.infer<
  typeof getUserRecoveryPackageParamsSchema
>;

export const getUserRecoveryPackageResponseSchemas = {
  200: z.object({
    data: z.object({
      recoveryPackage: userRecoveryPackageSchema,
    }),
    message: z.string(),
    success: z.boolean(),
  }),
  default: defaultResponse,
};
