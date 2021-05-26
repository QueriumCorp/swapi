"use strict";

const fp = require("fastify-plugin");

module.exports = fp(async function (fastify, opts) {
  fastify.decorate("createSessionCode", function (id, studentId) {
    return encodeURIComponent(
      id.replace(/[^0-9a-z]/gi, "") +
        "$" +
        studentId.replace(/[^a-zA-Z0-9]/g, "") +
        "$" +
        Date.now()
    );
  });
});
