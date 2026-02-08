import { z } from "zod";

export const getToolsCount200ResponseSchema = z.object({
  data: z.number(),
  message: z.string(),
  success: z.boolean(),
});
