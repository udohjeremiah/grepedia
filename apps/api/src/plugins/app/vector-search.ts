import { type FeatureExtractionPipeline, pipeline } from "@xenova/transformers";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    embedder?: FeatureExtractionPipeline;
    generateVectorEmbeddings(text: string): Promise<number[]>;
  }
}

/**
 * This plugin provides utilities for generating
 * vector embeddings for semantic search.
 *
 * @see https://redis.io/blog/vector-search-guide
 * @see https://www.mongodb.com/docs/atlas/atlas-vector-search
 * @see https://www.npmjs.com/package/@xenova/transformers
 */
export default fp(
  async (fastify) => {
    let loading: Promise<void> | undefined;

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
        normalize: true,
        pooling: "mean",
      });

      return [...output.data];
    };

    fastify.decorate("embedder");
    fastify.decorate("generateVectorEmbeddings", generateVectorEmbeddings);

    fastify.addHook("onReady", async () => {
      await loadModel();
    });
  },
  { name: "vector-search" },
);
