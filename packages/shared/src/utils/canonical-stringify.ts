/**
 * Produces a deterministic JSON string by recursively sorting object keys.
 *
 * This is useful when hashing or signing payloads where key order must
 * remain stable across environments.
 *
 * - Arrays preserve their original item order
 * - Object keys are sorted alphabetically at every depth
 * - Primitive values are stringified as-is
 *
 * @param value - The value to stringify in canonical form
 * @returns A JSON string with stable object key ordering
 */
export function canonicalStringify(value: unknown) {
  return JSON.stringify(sortObjectKeysDeep(value));
}

function sortObjectKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((element) => sortObjectKeysDeep(element));
  }

  if (value && typeof value === "object") {
    const objectValue = value as Record<string, unknown>;
    const sortedObject: Record<string, unknown> = {};

    // eslint-disable-next-line unicorn/no-array-sort
    for (const key of Object.keys(objectValue).sort()) {
      sortedObject[key] = sortObjectKeysDeep(objectValue[key]);
    }

    return sortedObject;
  }

  return value;
}
