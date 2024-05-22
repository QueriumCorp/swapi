"use strict";

import schema from "./heartbeat.schema.js";

export default async function (fastify, opts) {
  fastify.route({
    method: "GET",
    url: "/",
    schema: schema,
    handler: (request, reply) => {
      let rightNow = new Date().toISOString();
      return {
        alive: true,
        serverTime: rightNow,
      };
    },
  });
}
