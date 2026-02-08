/**
 * Cursor payload type representing pagination state.
 *
 * - `undefined`: No cursor (initial state)
 * - `{ type: "id", id }`: Cursor by document ID
 * - `{ type: "score", id, score }`: Cursor by score (for popularity sorting)
 * - `{ type: "date", id, date }`: Cursor by release date
 */
export type CursorPayload =
  | undefined
  | { date: string; id: string; type: "date" }
  | { id: string; score: number; type: "score" }
  | { id: string; type: "id" };

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
  return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
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
