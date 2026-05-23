import fp from "fastify-plugin";

type PreWarmOgOptions = {
  categories: string[];
  comments: number;
  description: string;
  name: string;
  officialUrl: string;
  upvotes: number;
};

declare module "fastify" {
  interface FastifyInstance {
    preWarmOg: (slug: string, options: PreWarmOgOptions) => void;
  }
}

/**
 * This plugin pre-warms the OG image cache immediately after a tool is
 * added/updated, so that social media crawlers receive an instant response
 * from cache instead of timing out waiting for the image to generate on-demand.
 */
export default fp(
  async (fastify) => {
    const preWarmOg = (slug: string, options: PreWarmOgOptions) => {
      const ogImage = new URL(
        `/tools/@${slug}/og`,
        fastify.env.CLIENT_BASE_URL,
      );

      ogImage.searchParams.set("name", options.name);
      ogImage.searchParams.set("officialUrl", options.officialUrl);
      ogImage.searchParams.set("description", options.description);
      ogImage.searchParams.set("categories", options.categories.join(","));
      ogImage.searchParams.set("upvotes", String(options.upvotes));
      ogImage.searchParams.set("comments", String(options.comments));

      fetch(ogImage).catch(() => {});
    };

    fastify.decorate("preWarmOg", preWarmOg);
  },
  { name: "pre-warm-og" },
);
