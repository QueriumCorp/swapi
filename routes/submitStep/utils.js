const he = require("he");

const createQueryString = function (request) {
  // Warning: qEval does case-sensitive replacement of percent escapes,
  // and expects lower case letters e.g. %2b NOT %2B
  const { appKey, studentId, id, step } = request.body;

  const appKeyPart = "?appKey=" + appKey.replace(/\s/g, "");
  const cmdPart = "&cmd=processLRV";
  const sessionCodePart = "&session=" + prepSessionCode(id, studentId);
  const stepPart = "&step=" + "STEPPART";

  let urlParts = [appKeyPart, cmdPart, sessionCodePart, stepPart];

  return urlParts.join("");
};

module.exports = {
  createQueryString,
};
