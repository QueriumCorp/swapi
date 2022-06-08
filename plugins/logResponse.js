"use strict";

const fp = require("fastify-plugin");

// Log the responses
module.exports = fp(async function (fastify, opts) {
  fastify.addHook('preSerialization', (request, reply, payload, done) => {
    if (payload) {
      request.log.info(
        {
          body: payload,
          context: reply.rapportiniContext
        },
        ':RESPONSE:'
      )
    }
    done()
  })
});