const he = require("he");
const fetch = require("node-fetch");

const createQueryString = function (request, sessionCode) {
  // Warning: qEval does case-sensitive replacement of percent escapes,
  // and expects lower case letters e.g. %2b NOT %2B
  const { appKey } = request.body;

  const appKeyPart = "?appKey=" + appKey.replace(/\s/g, "");
  const cmdPart = "&cmd=getGeneralHints";
  const sessionCodePart = "&session=" + sessionCode;

  return [appKeyPart, cmdPart, sessionCodePart].join("");
};

const parseResponse = function (response) {
  if (!response || !response.length || response.indexOf("network error") > -1) {
    return {
      success: false
    };
  }

  var delimiter = '"',
    start = 1,
    tokens = response.split(delimiter).slice(start);

  const rsltStr = tokens[0]
    .replace(/\\n/g, "\n")
    .replace(/%5C/g, "\\")
    .replace(
      /(<mo>)&#8744;(<\/mo>)/g,
      "<mspace width='.1em'/>$1OR$2<mspace width='.1em'/>"
    );

  let result = {
    success: true,
    hintText: rsltStr,
    hintObject: []
  }

  const tags = ["[FBMSG:END]", "[HINTMSG:END]", "[ERRMSG:END]"];
  let rsltObj = [];
  if (containsAnyTagsQ(rsltStr, tags)) {
    result = { ...result, "hintText": cleanAllTags(rsltStr) };

    // Convert the hint into object
    rsltObj = toObj(rsltStr, tags);

    // If the hint string converted successfully into an array of object
    if (rsltObj["status"]) {
      result = { ...result, "hintObject": rsltObj["data"] };
    }
  }

  return result;
};

const cleanAllTags = (str) => {
  let rslt = str.replace(/(\[ERRTYPE:START\](.*?)\[ERRTYPE:END\])|(\[HINTTYPE:START\](.*?)\[HINTTYPE:END\])|(\[FBTTYPE:START\](.*?)\[FBTTYPE:END\])/g, "")
  rslt = rslt.replace(/\[ERRMSG:START\]|\[ERRMSG:END\]|\[HINTMSG:START\]|\[HINTMSG:END\]|\[FBMSG:START\]|\[FBMSG:END\]/g, "")

  return rslt;
}

const toObj = (hintStr, tags) => {
  // Hints in array form
  let hintArr = toArray(hintStr, tags)

  // Conver the array into object
  const result = hintArr.map(item => itemToObj(item));

  return { status: true, data: result };
}

const itemToObj = (str) => {
  // Split the hint by starting message tag
  let arr = str.split(/\[HINTMSG:START\]|\[ERRMSG:START\]|\[FBMSG:START\]/g);

  // Remove the tags from the type part and trim it
  const hintType = arr[0].replace(
    /\[ERRTYPE:START\]|\[HINTTYPE:START\]|\[FBTTYPE:START\]|\[ERRTYPE:END\]|\[HINTTYPE:END\]|\[FBTTYPE:END\]/g,
    ""
  ).trim();

  // Trim the message part
  const hintMsg = arr[1].trim();

  // Identify tag type
  let tag = "HINT";
  if (arr[0].includes("ERRTYPE:START")) {
    tag = "ERROR";
  } else if (arr[0].includes("FBTTYPE:START")) {
    tag = "FB";
  }

  return {
    tag: tag,
    type: hintType,
    message: hintMsg
  }
}

const toArray = (hintStr, tags) => {
  const delimiter = mkDelimiter(tags);
  let result = hintStr.split(new RegExp(delimiter));

  // Cleanup any empty items
  result = result.filter(item => item.trim().length > 0);

  return result;
}

const mkDelimiter = arr => {
  let rslt = arr.join("|");
  rslt = rslt.replace(/\[/g, "\\[");
  rslt = rslt.replace(/\]/g, "\\]");

  return rslt;
}

const containsAnyTagsQ = (hintStr, tags) => {
  // const testStr = hintStr.toLowerCase();
  const testStr = hintStr;
  const rslt = tags.filter(aTag => testStr.includes(aTag));

  return rslt.length > 0;
}

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
  handleFetch,
  containsAnyTagsQ
};