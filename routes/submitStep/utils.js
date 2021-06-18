const createQueryString = function (request, sessionCode) {
  // Warning: qEval does case-sensitive replacement of percent escapes,
  // and expects lower case letters e.g. %2b NOT %2B
  const { appKey, step } = request.body;

  const appKeyPart = "?appKey=" + appKey.replace(/\s/g, "");
  const cmdPart = "&cmd=processLRV";
  const sessionCodePart = "&session=" + sessionCode;
  const stepPart = "&step=" + cleanUpStep(step);

  return [appKeyPart, cmdPart, sessionCodePart, stepPart].join("");
};

function parseResponse(response) {
  let str,
    status,
    start = 1,
    tokens;

  const delimiter = '"';

  if (response.lastIndexOf("reProcessLRV") > -1) {
    // invalid step
    tokens = response.split(delimiter).slice(start);
    response = tokens[0];
    str = response;
    status = "INVALID";
  } else if (response.lastIndexOf("processLRV") > -1) {
    // valid step
    tokens = response.split(delimiter).slice(start);
    response = tokens[0];
    if (response) {
      str = response;
      status = "VALID";
    } else {
      console.dir(response);
      str = response
        ? response
        : "This should not appear. See console for details. Please submit a comment and save the trace.";
      status = "ERROR";
    }
  } else if (response.lastIndexOf("getGrade") > -1) {
    tokens = response.split(delimiter).slice(start);
    response = tokens[0];
    str = response;
    status = "COMPLETE";
  } else if (response.lastIndexOf("ShowGrade") > -1) {
    tokens = response.split(delimiter).slice(start);
    response = tokens[0];
    str = response;
    status = "EXPIRED";
  } else {
    str =
      "Critical Error: qEval returned an unexpected response - " +
      response.data;
    status = 10;
  }

  return {
    stepStatus: status,
    message: str,
  };
}

module.exports = {
  createQueryString,
  parseResponse,
};

const cleanUpStep = function (step) {
  if (step.indexOf("MathML") > -1) {
    step = cleanMathML(step);
  } else {
    step = cleanLaTeX(step);
  }
  return step;
};
// clean up MathML for qEval
function cleanMathML(step) {
  var hasMathML = step.indexOf("MathML");
  if (hasMathML > -1) {
    step = step
      .replace(
        '<math xmlns="http://www.w3.org/1998/Math/MathML" display="inline">',
        "<math>"
      )
      .replace('<mstyle displaystyle="true">', "")
      .replace("</mstyle>", "")
      .replace(/(\r\n|\n|\r)/gm, "")
      .replace(/<mi>\sO\s<\/mi>\s*<mi>\sR\s<\/mi>/g, " <mo> || </mo> ")
      .replace(/\s+/g, "")
      .replace("=", "&#63449;")
      .replace(/\+/g, "&#x2b;");
    step = encodeURIComponent(step);
  }
  return step;
}

function cleanLaTeX(step) {
  step = step
    .replace(/\s+/g, "")
    .replace(/\+/g, "&#x2b;")
    .replace("=", "&#63449;");
  step = "\\begin{{equation}}" + step + "\\end{{equation}}";

  return encodeURIComponent(step);
}
