const he = require("he");

const createQueryString = function (request) {
  // Warning: qEval does case-sensitive replacement of percent escapes,
  // and expects lower case letters e.g. %2b NOT %2B
  const { appKey, sessionCode } = request.body;

  const appKeyPart = "?appKey=" + appKey.replace(/\s/g, "");
  const cmdPart = "&cmd=getGeneralHints";
  const sessionCodePart = "&session=" + sessionCode;

  return [appKeyPart, cmdPart, sessionCodePart].join("");
};

const parseResponse = function (response) {
  if (!response || !response.length || response.indexOf("network error") > -1) {
    return {
      success: false,
    };
  }

  var delimiter = '"',
    start = 1,
    tokens = response.split(delimiter).slice(start);

  result = tokens[0]
    .replace(/\\n/g, "\n")
    .replace(/%5C/g, "\\")
    .replace(
      /(<mo>)&#8744;(<\/mo>)/g,
      "<mspace width='.1em'/>$1OR$2<mspace width='.1em'/>"
    );

  return {
    success: true,
    hintText: result,
  };
};
module.exports = {
  createQueryString,
  parseResponse,
};
