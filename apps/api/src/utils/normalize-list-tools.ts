import { ObjectId } from "mongodb";

/**
 * Normalizes list tool references for consistent ordering and storage.
 *
 * Rules:
 * - sorts tools by ascending position
 * - converts string tool IDs into MongoDB `ObjectId` instances
 * - preserves only the normalized `position` and `toolId` fields
 */
export function normalizeListTools(
  tools: Array<{ position: number; toolId: string }>,
) {
  return tools
    .toSorted((a, b) => a.position - b.position)
    .map((tool) => ({
      position: tool.position,
      toolId: ObjectId.createFromHexString(tool.toolId),
    }));
}
