"use strict";

import fp from "fastify-plugin";

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

export default fp(async function(fastify, opts) {
  fastify.decorate("convertNameToUrl", function(sessionToken) {
    // If ai servers are not defined in the env
    if (!process.env.SWAPI_AISERVERS)
      return { status: true, url: process.env.SWAPI_SWSERVER };

    // Decode the JWT
    const session = fastify.jwt.decode(sessionToken);
    if (!session.aiName) {
      return {
        status: false,
        msg: "Missing aiName in the JWT"
      };
    }

    // Get the url of the server name
    const aiServerData = JSON.parse(process.env.SWAPI_AISERVERS);
    const serverInfo = aiServerData.filter(i => i.name === session.aiName);
    if (serverInfo.length < 1)
      return {
        status: false,
        msg: "Invalid aiName in the JWT"
      };

    return { status: true, url: serverInfo[0].url };
  });
});
