import { z } from "zod";

/**
 * Error thrown when a cursor cannot be decoded or fails schema validation.
 */
export class InvalidCursorError extends Error {
  constructor() {
    super("Invalid cursor");
    this.name = "InvalidCursorError";
  }
}

/**
 * Decodes a base64url cursor and validates it against the provided schema.
 *
 * @param cursor - The cursor string, or `undefined` for first-page requests.
 * @param schema - Zod schema used to validate cursor shape.
 * @returns A validated cursor payload, or `undefined` when no cursor was given.
 * @throws {InvalidCursorError} When decoding or validation fails.
 */
export function decodeCursor<TSchema extends z.ZodType>(
  cursor: string | undefined,
  schema: TSchema,
): undefined | z.infer<TSchema> {
  if (!cursor) return;

  try {
    const parsed = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    ) as unknown;

    return schema.parse(parsed);
  } catch {
    throw new InvalidCursorError();
  }
}

/**
 * Encodes any cursor payload into a base64url string.
 *
 * @param cursor - The validated cursor payload to encode.
 * @returns A base64url-encoded cursor string.
 */
export function encodeCursor<TCursor>(cursor: TCursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString("base64url");
}
