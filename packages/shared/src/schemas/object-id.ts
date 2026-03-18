import { z } from "zod";

/**
 * Canonical schema for MongoDB ObjectId values serialized as 24-character hex strings.
 */
export const objectIdSchema = z.stringFormat("ObjectId", /^[0-9a-fA-F]{24}$/);
