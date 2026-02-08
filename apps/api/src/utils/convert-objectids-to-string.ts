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
  object: T,
): ConvertObjectIdsToStrings<T> {
  // Not an object or null, return as is
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (object === null || typeof object !== "object") return object as any;

  // Single ObjectId
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (object instanceof ObjectId) return object.toString() as any;

  // Array
  if (Array.isArray(object)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return object.map((item) => convertObjectIdsToStrings(item)) as any;
  }

  // Object
  const result: Record<string, unknown> = {};
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      const value = (object as Record<string, unknown>)[key];
      if (value instanceof ObjectId) {
        result[key] = value.toString();
      } else if (value && typeof value === "object") {
        result[key] = convertObjectIdsToStrings(value);
      } else {
        result[key] = value;
      }
    }
  }

  return result as ConvertObjectIdsToStrings<T>;
}
