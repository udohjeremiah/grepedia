import { objectIdSchema } from "@workspace/shared/schemas/object-id-schema";
import { z } from "zod";

/**
 * Cursor payload type representing pagination state.
 *
 * - `undefined`: No cursor (initial state)
 * - `{ type: "id", id }`: Cursor by document ID
 * - `{ type: "score", id, score }`: Cursor by score (for popularity sorting)
 * - `{ type: "comments", id, comments }`: Cursor by recent comment count (for trending sorting)
 * - `{ type: "date", id, date }`: Cursor by release date
 */
const cursorPayloadSchema = z.discriminatedUnion("type", [
  z.object({
    date: z.iso.datetime(),
    id: objectIdSchema,
    type: z.literal("date"),
  }),
  z.object({
    comments: z.number(),
    id: objectIdSchema,
    type: z.literal("comments"),
  }),
  z.object({ id: objectIdSchema, score: z.number(), type: z.literal("score") }),
  z.object({ id: objectIdSchema, type: z.literal("id") }),
]);

export type CursorPayload = undefined | z.infer<typeof cursorPayloadSchema>;

export class InvalidCursorError extends Error {
  constructor() {
    super("Invalid cursor");
    this.name = "InvalidCursorError";
  }
}

/**
 * Decodes a base64url-encoded cursor string back to its payload.
 *
 * @param cursor - The base64url-encoded cursor string, or `undefined` for no cursor
 * @returns The decoded cursor payload
 *
 * @example
 * const decoded = decodeCursor("eyJ0eXBlIjoiaWQiLCJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSJ9");
 * // Returns: { type: "id", id: "507f1f77bcf86cd799439011" }
 */
export function decodeCursor(cursor?: string): CursorPayload {
  if (!cursor) return;

  try {
    const parsed = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    );

    return cursorPayloadSchema.parse(parsed);
  } catch {
    throw new InvalidCursorError();
  }
}

/**
 * Encodes a cursor payload to a base64url string for safe transmission.
 *
 * @param cursor - The cursor payload to encode
 * @returns A base64url-encoded string representation of the cursor
 *
 * @example
 * const encoded = encodeCursor({ type: "id", id: "507f1f77bcf86cd799439011" });
 * // Returns: "eyJ0eXBlIjoiaWQiLCJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSJ9"
 */
export function encodeCursor(cursor: CursorPayload): string {
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}
