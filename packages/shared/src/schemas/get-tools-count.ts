import { z } from "zod";

export const getToolsCount200ResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.number(),
});
