/**
 * Creates a shallow copy of an object with the specified keys removed.
 *
 * - Does not mutate the original object
 * - Removes only top-level properties
 * - Type-safe: only keys of the object can be omitted
 *
 * @param obj - The source object
 * @param keys - The keys to omit from the object
 * @returns A new object without the specified keys
 */
export function omitKeys<T extends object, K extends keyof T>(
  object: T,
  keys: readonly K[],
): Omit<T, K> {
  const result = { ...object };

  for (const key of keys) {
    delete result[key];
  }

  return result;
}
