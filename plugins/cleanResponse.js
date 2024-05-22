"use strict";

import fp from "fastify-plugin";
import hePkg from "he";
const {decode} = hePkg;

export default fp(async function (fastify, opts) {
  fastify.decorate("cleanResponse", function (dirty) {
    var resultStart = dirty.indexOf("<result>") + 8;
    var resultEnd = dirty.indexOf("</result>") - 8;
    return decode(dirty.slice(resultStart, resultEnd));
  });
});
