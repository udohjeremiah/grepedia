import fp from "fastify-plugin";
import { Resend } from "resend";

declare module "fastify" {
  interface FastifyInstance {
    resend: Resend;
  }
}

/**
 * This plugin initializes and configures
 * email delivery using Resend.
 *
 * @see {@link https://resend.com}
 */
export default fp(
  async (fastify) => {
    const resend = new Resend(fastify.env.RESEND_API_KEY);

    fastify.decorate("resend", resend);
  },
  { dependencies: ["env"], name: "resend" },
);
