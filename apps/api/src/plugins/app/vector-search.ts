import { type FeatureExtractionPipeline, pipeline } from "@xenova/transformers";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    embedder: FeatureExtractionPipeline | null;
    generateVectorEmbeddings(text: string): Promise<number[]>;
    cosineSimilarity(a: number[], b: number[]): number;
  }
}

/**
 * This plugin provides utilities for generating
 * vector embeddings and performing similarity
 * calculations for semantic search.
 *
 * @see https://redis.io/blog/vector-search-guide
 * @see https://www.mongodb.com/docs/atlas/atlas-vector-search
 * @see https://www.npmjs.com/package/@xenova/transformers
 */
export default fp(
  async (fastify) => {
    let loading: Promise<void> | null = null;

    const loadModel = async () => {
      if (fastify.embedder) return;

      if (!loading) {
        loading = (async () => {
          try {
            fastify.embedder = await pipeline(
              "feature-extraction",
              "Xenova/all-MiniLM-L6-v2",
            );
          } catch (error) {
            fastify.log.error({ error }, "Failed to load embedding pipeline");
          }
        })();
      }

      await loading;
    };

    const generateVectorEmbeddings = async (text: string) => {
      if (!text.trim()) {
        throw new Error("Cannot generate vector embeddings from empty text");
      }

      if (!fastify.embedder) {
        await loadModel();
      }

      if (!fastify.embedder) {
        throw new Error("Embedding pipeline is not available");
      }

      const output = await fastify.embedder(text, {
        pooling: "mean",
        normalize: true,
      });

      return Array.from(output.data);
    };

    const cosineSimilarity = (a: number[], b: number[]) => {
      if (a.length !== b.length) {
        throw new Error("Vectors must have the same length");
      }

      let dot = 0;
      let normA = 0;
      let normB = 0;

      for (let i = 0; i < a.length; i++) {
        dot += a[i]! * b[i]!;
        normA += a[i]! ** 2;
        normB += b[i]! ** 2;
      }

      if (normA === 0 || normB === 0) return 0;

      return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    };

    fastify.decorate("embedder", null);
    fastify.decorate("generateVectorEmbeddings", generateVectorEmbeddings);
    fastify.decorate("cosineSimilarity", cosineSimilarity);

    fastify.addHook("onReady", async () => {
      await loadModel();
    });
  },
  { name: "vector-search" },
);
