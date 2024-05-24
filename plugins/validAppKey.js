"use strict";

import fp from "fastify-plugin";

export default fp(async function (fastify, opts) {
  fastify.decorate("validAppKey", function (appKey) {
    const validAppKeys = process.env.VALID_APP_KEYS.split(" ");
    console.info("|--------------------------------------------------|");
    console.info("|- validAppKeys:", process.env.VALID_APP_KEYS);
    console.info("|--------------------------------------------------|");
    const found = (validKey) => validKey == appKey;
    return validAppKeys.findIndex(found) > -1 ? true : false;
  });
});
