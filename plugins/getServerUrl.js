"use strict";

import fp from "fastify-plugin";

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

export default fp(async function(fastify, opts) {
  fastify.decorate("getServerURL", function() {
    // If ai servers are not defined in the env
    if (!process.env.SWAPI_AISERVERS)
      fastify.log.info("No SWAPI_AISERVERS in the environment");
      return { name: "default", url: process.env.SWAPI_SWSERVER };

    // Select an Ai server
    try {
      return pickAiServer();
    } catch (error) {
      fastify.log.error("Unable to pick an Ai server");
    }

    return { name: "default", url: process.env.SWAPI_SWSERVER };
  });
});

const pickAiServer = () => {
  const aiServerData = JSON.parse(process.env.SWAPI_AISERVERS);

  // Randomly pick an Ai servere from available servers in the env
  // NOTE: the value (integer) of the "power" field indicates the capability of
  // the server. Probability of getting selected increases with the higher
  // power value. An Ai server with power 2 is twice as likely to be picked as
  // an Ai server with power 1.
  let indices = aiServerData
    .map((i, idx) => {
      let idxRepeat = [];
      if (i.power) {
        for (let j in [...Array(i.power)]) {
          idxRepeat.push(idx);
        }
      } else {
        idxRepeat.push(idx);
      }
      return idxRepeat;
    })
    .flat();
  const idxServer = Math.floor(Math.random() * indices.length);

  // Select an AI server based on the randomly selected index
  const pickedServer = aiServerData[indices[idxServer]];

  fastify.log.info('picked server name:'+pickedServer.name+' url:'+pickedServer.url);
  return { name: pickedServer.name, url: pickedServer.url };
};
