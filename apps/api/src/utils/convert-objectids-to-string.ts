import { ObjectId } from "mongodb";

/**
 * Type utility to recursively replace all ObjectIds in T with strings.
 */
export type ConvertObjectIdsToStrings<T> = T extends ObjectId
  ? string
  : T extends Array<infer U>
    ? Array<ConvertObjectIdsToStrings<U>>
    : T extends object
      ? { [K in keyof T]: ConvertObjectIdsToStrings<T[K]> }
      : T;

/**
 * Recursively converts all `ObjectId` fields in an object to strings.
 *
 * @param obj - The object to convert
 * @returns A new object with all `ObjectId`s converted to strings
 *
 * @example
 * const user = { _id: new ObjectId(), nested: { _id: new ObjectId() } };
 * const result = convertObjectIdsToStrings(user);
 */
export function convertObjectIdsToStrings<T>(
  obj: T,
): ConvertObjectIdsToStrings<T> {
  // Not an object or null, return as is
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (obj === null || typeof obj !== "object") return obj as any;

  // Single ObjectId
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (obj instanceof ObjectId) return obj.toString() as any;

  // Array
  if (Array.isArray(obj)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return obj.map((item) => convertObjectIdsToStrings(item)) as any;
  }

  // Object
  const result: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = (obj as Record<string, unknown>)[key];
      result[key] =
        value instanceof ObjectId
          ? value.toString()
          : value && typeof value === "object"
            ? convertObjectIdsToStrings(value)
            : value;
    }
  }

  return result as ConvertObjectIdsToStrings<T>;
}
