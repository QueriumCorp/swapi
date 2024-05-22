"use strict";

import fp from "fastify-plugin";

export default fp(async function (fastify, opts) {
  fastify.decorate("validAppKey", function (appKey) {
    const validAppKeys = ["StepWiseAPI", "101EDU"];

    const found = (validKey) => validKey == appKey;
    return validAppKeys.findIndex(found) > -1 ? true : false;
  });
});
