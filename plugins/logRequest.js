"use strict";

import fp from "fastify-plugin";

// Log the requests
export default fp(async function (fastify, opts) {
  fastify.addHook('preHandler', function (req, reply, done) {
    if (req.body) {
      req.log.info(
        {
          method: req.method,
          url: req.url,
          body: req.body,
          headers: req.headers
        },
        ':REQUEST:'
      )
    }
    done()
  })

});