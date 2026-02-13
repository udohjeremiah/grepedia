import { ObjectId } from "mongodb";

export type SerializedMongoTypes<T> = T extends ObjectId
  ? string
  : T extends Date
    ? string
    : T extends Array<infer U>
      ? Array<SerializedMongoTypes<U>>
      : T extends object
        ? { [K in keyof T]: SerializedMongoTypes<T[K]> }
        : T;

export type SerializeMongoTypesOptions = {
  date?: boolean;
  objectId?: boolean;
};

type NormalizedOptions = {
  date: boolean;
  objectId: boolean;
};

/**
 * Serializes MongoDB types into JavaScript-friendly values.
 *
 * Defaults:
 * - `ObjectId` -> string
 * - `Date` -> ISO string
 *
 * Options let you toggle which MongoDB types are serialized.
 *
 * @param obj - The object to serialize
 * @param options - Serialization options
 * @returns A new object with requested conversions applied
 *
 * @example
 * const user = { _id: new ObjectId(), createdAt: new Date() };
 * const result = serializeMongoTypes(user, { date: true, objectId: true });
 */
export function serializeMongoTypes<T>(
  object: T,
  options: SerializeMongoTypesOptions = {},
): SerializedMongoTypes<T> {
  const normalizedOptions = {
    date: options.date ?? true,
    objectId: options.objectId ?? true,
  };

  return serializeValue(object, normalizedOptions) as SerializedMongoTypes<T>;
}

function serializeObject(
  object: Record<string, unknown>,
  options: NormalizedOptions,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      result[key] = serializeValue(object[key], options);
    }
  }

  return result;
}

function serializeValue(value: unknown, options: NormalizedOptions): unknown {
  if (value === null || typeof value !== "object") return value;

  if (value instanceof ObjectId) {
    return options.objectId ? value.toString() : value;
  }

  if (value instanceof Date) {
    return options.date ? value.toISOString() : value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => serializeValue(item, options));
  }

  return serializeObject(value as Record<string, unknown>, options);
}
