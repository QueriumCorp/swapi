"use strict";

const fp = require("fastify-plugin");

// Log the requests
module.exports = fp(async function (fastify, opts) {
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