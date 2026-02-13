import { z } from "zod";

export const defaultResponse = z.object({
  data: z.unknown().optional(),
  message: z.string(),
  success: z.boolean(),
});
