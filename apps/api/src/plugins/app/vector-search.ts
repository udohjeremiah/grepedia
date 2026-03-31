import type { DataArray } from "@xenova/transformers";

import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyInstance {
    embedder?: {
      (
        input: string | string[],
        options: {
          normalize: boolean;
          pooling: "mean";
        },
      ): Promise<{ data: DataArray }>;
    };
    generateEmbeddings(contents: string[]): Promise<number[]>;
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
    const isProduction = fastify.env.NODE_ENV === "production";

    let loading: Promise<void> | undefined;

    const loadModel = async () => {
      if (fastify.embedder) return;

      if (!loading) {
        loading = (async () => {
          try {
            const { pipeline } = await import("@xenova/transformers");
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

    const generateEmbeddings = async (contents: string[]) => {
      const combined = contents.filter(Boolean).join("\n");
      if (!combined.trim()) {
        throw new Error("Cannot generate embeddings from empty content");
      }

      if (!isProduction) {
        await loadModel();

        if (!fastify.embedder) {
          throw new Error(
            "Local embedder is not available. Install @xenova/transformers or use the Gemini embedder.",
          );
        }

        const output = await fastify.embedder(combined, {
          normalize: true,
          pooling: "mean",
        });

        return [...output.data];
      }

      const result = await fastify.gemini.models.embedContent({
        config: {
          outputDimensionality: 768,
          taskType: "SEMANTIC_SIMILARITY",
        },
        contents: combined,
        model: "gemini-embedding-001",
      });

      const embedding = result.embeddings?.[0]?.values;
      if (!embedding || embedding.length === 0) {
        throw new Error("Gemini embedContent returned empty embeddings");
      }

      return embedding;
    };

    fastify.addHook("onReady", async () => {
      if (!isProduction) {
        loadModel();
      }
    });

    fastify.decorate("embedder");
    fastify.decorate("generateEmbeddings", generateEmbeddings);
  },
  { dependencies: ["gemini"], name: "vector-search" },
);
