"use strict";

const fp = require("fastify-plugin");
const he = require("he");

module.exports = fp(async function (fastify, opts) {
  fastify.decorate("cleanResponse", function (dirty) {
    var resultStart = dirty.indexOf("<result>") + 8;
    var resultEnd = dirty.indexOf("</result>");
    return he.decode(dirty.slice(resultStart, resultEnd));
  });
});
