import fp from "fastify-plugin";
import jwtPkg from "@fastify/jwt"

export default fp(async function (fastify, opts) {
  fastify.register(jwtPkg, {
    secret: "supersecret",
  });

  fastify.decorate("authenticate", async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
});
