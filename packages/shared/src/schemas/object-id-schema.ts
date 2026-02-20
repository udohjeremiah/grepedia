import { z } from "zod";

export const objectIdSchema = z.stringFormat("ObjectId", /^[0-9a-fA-F]{24}$/);
