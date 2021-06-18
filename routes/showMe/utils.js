const he = require("he");

const createQueryString = function (request, sessionCode) {
  // Warning: qEval does case-sensitive replacement of percent escapes,
  // and expects lower case letters e.g. %2b NOT %2B
  const { appKey } = request.body;

  const appKeyPart = "?appKey=" + appKey.replace(/\s/g, "");
  const cmdPart = "&cmd=showMe";
  const sessionCodePart = "&session=" + sessionCode;

  return [appKeyPart, cmdPart, sessionCodePart].join("");
};

const parseResponse = function (response) {
  if (!response || !response.length || response.indexOf("network error") > -1) {
    return {
      success: false,
    };
  }

  let listStart, listEnd;
  let instructions = [],
    list = [],
    step = [];

  listStart = response.indexOf("List[") + 10;
  listEnd = response.lastIndexOf("]");
  let result = response.slice(listStart, listEnd);
  list = result.split("], List[");

  if (!result.length) {
    // if no results
    instructions.length = 0;
  } else if (list.length) {
    // trim resulting strings
    for (var i = 0; i < list.length; i++) {
      step = list[i].split('", "');
      step[0] = step[0]
        .replace(
          /(<mo>)&#8744;(<\/mo>)/g,
          "<mspace width='.1em' />$1OR$2<mspace width='.1em' />"
        )
        .replace(/%5C/g, "\\");
      step[1] = step[1]
        .replace(
          /(<mo>)&#8744;(<\/mo>)/g,
          "<mspace width='.1em' />$1OR$2<mspace width='.1em' />"
        )
        .replace(/%5C/g, "\\");
      instructions[i] = {
        suggestedStep: step[0].slice(1, step[0].length),
        instruction: step[1].slice(0, step[1].length - 1),
      };
    }
  } else {
    // no results returned
    instructions.length = 0;
  }

  return {
    success: true,
    instructions: instructions,
  };
};

module.exports = {
  createQueryString,
  parseResponse,
};
