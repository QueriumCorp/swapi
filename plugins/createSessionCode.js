"use strict";

import fp from "fastify-plugin";

export default fp(async function (fastify, opts) {
  fastify.decorate("createSessionCode", function (sessionToken) {
    const session = fastify.jwt.decode(sessionToken);

    return encodeURIComponent(
      session.id.replace(/[^0-9a-z]/gi, "") +
        "$" +
        session.studentId.replace(/[^a-zA-Z0-9]/g, "") +
        "$" +
        session.startedAt
    );
  });
});
