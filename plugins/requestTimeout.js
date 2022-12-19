"use strict";

const fp = require("fastify-plugin");
const he = require("he");

// exports.hasTimeoutError = function (text) {
//   idx = text.toLowerCase().lastIndexOf("the system has timed out");
//   return idx > 0;
// };

const hasTimeoutError = (text) => {
  const idx = text.lastIndexOf("ERROR:START");
  return idx > 0;
};

module.exports = fp(async function (fastify, opts) {
  fastify.decorate("didCompleteInTime", function (rspns) {
    console.log("rspns");
    console.log(rspns);
    let rslt = {
      isTimeoutError: false,
      type: null, msg: rspns, waitTime: -1, correctStepQ: null, feedback: "",
      jsonMsg: ""
    };

    if (!hasTimeoutError(rspns)) {
      return rslt;
    }

    rslt.isTimeoutError = true;
    const tagStart = "[ERROR:START]";
    const tagEnd = "[ERROR:END]";
    const idxStart = rspns.indexOf(tagStart);
    const idxEnd = rspns.indexOf(tagEnd);
    if (idxStart < 0 || idxEnd < 0 || idxEnd < idxStart) {
      fastify.log.error("Invalid timeout tags in the response");
      fastify.log.error(rspns);
      return rslt;
    }

    const jsonText = rspns.slice(idxStart + tagStart.length, idxEnd);
    try {
      return { jsonStr: jsonText, ...rslt, ...JSON.parse(jsonText) };
    } catch (e) {
      fastify.log.error("Unable to parse the json in the timeout response");
      fastify.log.error(jsonText);
      return rslt;
    }
  });
});

// module.exports = { processTimeoutError };