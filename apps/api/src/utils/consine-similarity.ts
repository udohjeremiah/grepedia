/**
 * Computes the cosine similarity between two numerical vectors.
 *
 * @param a - The first vector
 * @param b - The second vector
 * @returns The cosine similarity score between 0 and 1
 * @throws Error if vectors have different lengths
 *
 * @example
 * const similarity = cosineSimilarity([1, 2, 3], [4, 5, 6]);
 * console.log(similarity); // ~0.9746
 */
export function cosineSimilarity(a: number[], b: number[]) {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (const [index, element] of a.entries()) {
    dot += element! * b[index]!;
    normA += element! ** 2;
    normB += b[index]! ** 2;
  }

  if (normA === 0 || normB === 0) return 0;

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
