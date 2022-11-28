"use strict";

const fp = require("fastify-plugin");
const he = require("he");

module.exports = fp(async function (fastify, opts) {
  fastify.decorate("didCompleteInTime", function (rspns) {
    if (rspns.lastIndexOf("The system has timed out;") > -1) {
      return false;
    }
    return true;
  });
});