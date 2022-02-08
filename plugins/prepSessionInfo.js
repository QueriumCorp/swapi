"use strict";

const fp = require("fastify-plugin");

module.exports = fp(async function(fastify, opts) {
  fastify.decorate("prepSessionInfo", function(id, studentId, aiName) {
    const rightNow = Date.now();
    return {
      sessionCode: encodeURIComponent(
        id.replace(/[^0-9a-z]/gi, "") +
          "$" +
          studentId.replace(/[^a-zA-Z0-9]/g, "") +
          "$" +
          rightNow
      ),
      sessionToken: fastify.jwt.sign({
        id,
        studentId,
        aiName,
        startedAt: rightNow
      })
    };
  });
});
