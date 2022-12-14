"use strict";

const fp = require("fastify-plugin");

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

module.exports = fp(async function (fastify, opts) {
  fastify.decorate("getServerURL", function () {
    // If ai servers are not defined in the env
    if (!process.env.AISERVERS)
      return { name: "default", url: process.env.SWSERVER };

    // Select an Ai server
    try {
      return pickAiServer();
    } catch (error) {
      fastify.log.error("Unable to pick an Ai server");
    }

    return { name: "default", url: process.env.SWSERVER };
  });
});

const pickAiServer = () => {
  const aiServerData = JSON.parse(process.env.AISERVERS);

  // Randomly pick an Ai servere from available servers in the env
  // NOTE: the value (integer) of the "power" field indicates the capability of
  // the server. Probability of getting selected increases with the higher
  // power value. An Ai server with power 2 is twice as likely to be picked as
  // an Ai server with power 1.
  let indices = aiServerData
    .map((i, idx) => {
      // If the power field is not defined, assign 1 power
      if (!("power" in i)) {
        return [idx];
      }

      // If the value of the power is a string
      let powerVal = i.power;
      if (typeof i.power === "string") {
        powerVal = parseInt(i.power);
      }

      return Array(powerVal).fill(idx);
    })
    .flat();
  const idxServer = Math.floor(Math.random() * indices.length);

  // Select an AI server based on the randomly selected index
  const pickedServer = aiServerData[indices[idxServer]];

  return { name: pickedServer.name, url: pickedServer.url };
};
