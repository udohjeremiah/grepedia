import { z } from "zod";

/**
 * Canonical schema for route/document slugs.
 */
export const slugSchema = z.string().min(1);
