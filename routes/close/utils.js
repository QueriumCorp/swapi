const he = require("he");

const createQueryString = function (request) {
  // Warning: qEval does case-sensitive replacement of percent escapes,
  // and expects lower case letters e.g. %2b NOT %2B
  const { appKey, sessionCode } = request.body;

  const appKeyPart = "?appKey=" + appKey.replace(/\s/g, "");
  const cmdPart = "&cmd=closeSession";
  const sessionCodePart = "&session=" + sessionCode;

  return [appKeyPart, cmdPart, sessionCodePart].join("");
};

const parseResponse = function (response) {
  if (!response || !response.length || response.indexOf("network error") > -1) {
    return {
      success: false,
    };
  }

  return {
    success: true,
  };
};

module.exports = {
  createQueryString,
  parseResponse,
};
