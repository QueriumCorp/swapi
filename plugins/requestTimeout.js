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

const processTimeoutError = (text) => {
  const textAlt = he.decode(text);
  let rslt = {
    isTimeoutError: false,
    type: null, msg: textAlt, waitTime: -1, correctStepQ: null, feedback: ""
  };

  if (!hasTimeoutError(textAlt)) {
    return rslt;
  }

  rslt.isTimeoutError = true;
  const tagStart = "[ERROR:START]";
  const tagEnd = "[ERROR:END]";
  const idxStart = textAlt.lastIndexOf(tagStart);
  const idxEnd = textAlt.lastIndexOf(tagEnd);
  const jsonText = textAlt.slice(idxStart + tagStart.length, idxEnd);
  try {
    return { ...rslt, ...JSON.parse(jsonText) };
  } catch (e) {
    // console.log("INVALID: timeout response");
    return rslt;
  }
};

module.exports = fp(async function (fastify, opts) {
  fastify.decorate("didCompleteInTime", function (rspns) {
    return processTimeoutError(rspns);
  });
});

module.exports = { processTimeoutError };