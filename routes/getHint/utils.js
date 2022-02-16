const he = require("he");
const fetch = require("node-fetch");

const createQueryString = function(request, sessionCode) {
  // Warning: qEval does case-sensitive replacement of percent escapes,
  // and expects lower case letters e.g. %2b NOT %2B
  const { appKey } = request.body;

  const appKeyPart = "?appKey=" + appKey.replace(/\s/g, "");
  const cmdPart = "&cmd=getGeneralHints";
  const sessionCodePart = "&session=" + sessionCode;

  return [appKeyPart, cmdPart, sessionCodePart].join("");
};

const parseResponse = function(response) {
  if (!response || !response.length || response.indexOf("network error") > -1) {
    return {
      success: false
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
    hintText: result
  };
};

const handleFetch = async (fullURL, queryString) => {
  // Fetch the url
  const response = await fetch(fullURL);

  // Check for a bad response from qEval
  if (response.status !== 200) {
    const error = new Error("There was an error in the StepWise Server");
    error.statusCode = response.status;
    error.error = "There was an error in the StepWise Server";
    error.message = response.statusText;
    error.details = queryString;

    return error;
  }

  return await response.text();
};

module.exports = {
  createQueryString,
  parseResponse,
  handleFetch
};
