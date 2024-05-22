"use strict";

import fp from "fastify-plugin";

// Log the responses
export default fp(async function (fastify, opts) {
  fastify.addHook('preSerialization', (request, reply, payload, done) => {
    if (payload) {
      request.log.info(
        {
          body: payload
        },
        ':RESPONSE:'
      )
    }
    done()
  })
});