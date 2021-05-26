const he = require("he");

const createQueryString = function (sessionCode, request) {
  // Warning: qEval does case-sensitive replacement of percent escapes,
  // and expects lower case letters e.g. %2b NOT %2B
  const { appKey, topic, definition, hints } = request.body;

  const appKeyPart = "?appKey=" + appKey.replace(/\s/g, "");
  const cmdPart = "&cmd=initializeSession";
  const sessionCodePart = "&session=" + sessionCode;
  const classCodePart = "&class=" + encodeURIComponent(topic);
  const questionPart = "&question=" + prepQuestionDef(definition);
  const policyPart = "&policies=" + "$A1$";
  const hint1Part = "&qs1=" + prepQueryString(hints[0]);
  const hint2Part = "&qs2=" + prepQueryString(hints[1]);
  const hint3Part = "&qs3=" + prepQueryString(hints[2]);

  let urlParts = [
    appKeyPart,
    cmdPart,
    sessionCodePart,
    classCodePart,
    questionPart,
    policyPart,
    hint1Part,
    hint2Part,
    hint3Part,
  ];

  return urlParts.join("");
};

// clean up webMMA response data
const cleanResponse = function (result) {
  // console.info("result: ", result);
  // grab everything inside the <result> element
  var resultStart = result.indexOf("<result>") + 8;
  var resultEnd = result.indexOf("</result>") - 8;
  result = result.slice(resultStart, resultEnd);
  return he.decode(result);
};

const getMathML = function (result) {
  const mathMLstart = result.indexOf("<math>");
  const mathMLend = result.indexOf("</math>") + 7;
  let mathML = result.slice(mathMLstart, mathMLend);
  return mathML.replace(/mtablerowspacing/g, "mtable rowspacing");
};

// discovers the identifiers (variables) in the problem
const getIdentifiers = function (list) {
  let listStart, listEnd;
  let identifiers = [];

  // operators list
  const fourthListToken = list.lastIndexOf("List[");

  // identifiers list
  const thirdListToken = list.lastIndexOf("List[", fourthListToken - 1);

  listStart = thirdListToken + 5;
  listEnd = list.lastIndexOf("]", fourthListToken);
  list = list.slice(listStart, listEnd);
  if (list.length) {
    identifiers = list.split(",");
  } else {
    identifiers = [];
  }

  // cleanup resulting strings
  for (let i = 0; i < identifiers.length; i++) {
    // strip extraneous quotes.  Because Wolfram forcibly converts any string
    // that looks like math (e.g., "cm^3") into a symbol, qEval has to wrap
    // these identifiers in quotes.
    identifiers[i] = identifiers[i].replace(/["]+/g, "");

    identifiers[i] = identifiers[i].trim();

    // convert MMA greek char encodings to UTF-8
    identifiers[i] = identifiers[i] === "\\[Alpha]" ? "α" : identifiers[i];
    identifiers[i] =
      identifiers[i] === "\\[CapitalAlpha]" ? "Α" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[Beta]" ? "β" : identifiers[i];
    identifiers[i] =
      identifiers[i] === "\\[CapitalBeta]" ? "Β" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[Gamma]" ? "γ" : identifiers[i];
    identifiers[i] =
      identifiers[i] === "\\[CapitalGamma]" ? "Γ" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[Delta]" ? "δ" : identifiers[i];
    identifiers[i] =
      identifiers[i] === "\\[CapitalDelta]" ? "Δ" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[Epsilon]" ? "ϵ" : identifiers[i];
    identifiers[i] =
      identifiers[i] === "\\[CapitalEpsilon]" ? "Ε" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[Zeta]" ? "ζ" : identifiers[i];
    identifiers[i] =
      identifiers[i] === "\\[CapitalZeta]" ? "Ζ" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[Eta]" ? "η" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[CapitalEta]" ? "Η" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[Theta]" ? "θ" : identifiers[i];
    identifiers[i] =
      identifiers[i] === "\\[CapitalTheta]" ? "Θ" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[Iota]" ? "ι" : identifiers[i];
    identifiers[i] =
      identifiers[i] === "\\[CapitalIota]" ? "Ι" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[Kappa]" ? "κ" : identifiers[i];
    identifiers[i] =
      identifiers[i] === "\\[CapitalKappa]" ? "Κ" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[Lambda]" ? "λ" : identifiers[i];
    identifiers[i] =
      identifiers[i] === "\\[CapitalLambda]" ? "Λ" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[Mu]" ? "μ" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[CapitalMu]" ? "Μ" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[Nu]" ? "ν" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[CapitalNu]" ? "Ν" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[Xi]" ? "ξ" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[CapitalXi]" ? "Ξ" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[Omicron]" ? "ο" : identifiers[i];
    identifiers[i] =
      identifiers[i] === "\\[CapitalOmicron]" ? "Ο" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[Pi]" ? "π" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[CapitalPi]" ? "Π" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[Rho]" ? "ρ" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[CapitalRho]" ? "Ρ" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[Sigma]" ? "σ" : identifiers[i];
    identifiers[i] =
      identifiers[i] === "\\[CapitalSigma]" ? "Σ" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[Tau]" ? "τ" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[CapitalTau]" ? "Τ" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[Upsilon]" ? "υ" : identifiers[i];
    identifiers[i] =
      identifiers[i] === "\\[CapitalUpsilon]" ? "Υ" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[Phi]" ? "ϕ" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[CapitalPhi]" ? "Φ" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[Chi]" ? "χ" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[CapitalChi]" ? "Χ" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[Psi]" ? "ψ" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[CapitalPsi]" ? "Ψ" : identifiers[i];
    identifiers[i] = identifiers[i] === "\\[Omega]" ? "ω" : identifiers[i];
    identifiers[i] =
      identifiers[i] === "\\[CapitalOmega]" ? "Ω" : identifiers[i];
  }

  for (let i = 0; i < identifiers.length; i++) {
    if (/^U\+/.test(identifiers[i])) {
      identifiers[i] = String.fromCharCode(
        parseInt("0x" + identifiers[i].substring(2, 10))
      );
    }
  }

  return identifiers;
};

// discovers the special operators for the problem
const getOperators = function (list) {
  const qEvalStyle = list.match(/List\[/g)?.length ?? 0;
  let listStart,
    listEnd,
    nesting = 0;
  let operators = [];

  if (qEvalStyle === 2) {
    // pre-July
    return [];
  } else {
    listStart = list.lastIndexOf("List[") + 5;
    listEnd = listStart;

    // find end of List[ block
    do {
      listEnd++;
      if (list.charAt(listEnd) === "[") {
        nesting++;
      } else if (list.charAt(listEnd) === "]") {
        nesting--;
      }
    } while (listEnd < list.length && nesting > -1);

    list = list.slice(listStart, listEnd);
    operators = list.split(",");

    // trim resulting strings and convert Wolfram greek letters to UTF-8
    for (let i = 0; i < operators.length; i++) {
      operators[i] = operators[i].trim().replace(/['"]+/g, "");

      operators[i] = operators[i].replace("\\[Alpha]", "α");
      operators[i] = operators[i].replace("\\[CapitalAlpha]", "Α");
      operators[i] = operators[i].replace("\\[Beta]", "β");
      operators[i] = operators[i].replace("\\[CapitalBeta]", "Β");
      operators[i] = operators[i].replace("\\[Gamma]", "γ");
      operators[i] = operators[i].replace("\\[CapitalGamma]", "Γ");
      operators[i] = operators[i].replace("\\[Delta]", "δ");
      operators[i] = operators[i].replace("\\[CapitalDelta]", "Δ");
      operators[i] = operators[i].replace("\\[Epsilon]", "ϵ");
      operators[i] = operators[i].replace("\\[CapitalEpsilon]", "Ε");
      operators[i] = operators[i].replace("\\[Zeta]", "ζ");
      operators[i] = operators[i].replace("\\[CapitalZeta]", "Ζ");
      operators[i] = operators[i].replace("\\[Eta]", "η");
      operators[i] = operators[i].replace("\\[CapitalEta]", "Η");
      operators[i] = operators[i].replace("\\[Theta]", "θ");
      operators[i] = operators[i].replace("\\[CapitalTheta]", "Θ");
      operators[i] = operators[i].replace("\\[Iota]", "ι");
      operators[i] = operators[i].replace("\\[CapitalIota]", "Ι");
      operators[i] = operators[i].replace("\\[Kappa]", "κ");
      operators[i] = operators[i].replace("\\[CapitalKappa]", "Κ");
      operators[i] = operators[i].replace("\\[Lambda]", "λ");
      operators[i] = operators[i].replace("\\[CapitalLambda]", "Λ");
      operators[i] = operators[i].replace("\\[Mu]", "μ");
      operators[i] = operators[i].replace("\\[CapitalMu]", "Μ");
      operators[i] = operators[i].replace("\\[Nu]", "ν");
      operators[i] = operators[i].replace("\\[CapitalNu]", "Ν");
      operators[i] = operators[i].replace("\\[Xi]", "ξ");
      operators[i] = operators[i].replace("\\[CapitalXi]", "Ξ");
      operators[i] = operators[i].replace("\\[Omicron]", "ο");
      operators[i] = operators[i].replace("\\[CapitalOmicron]", "Ο");
      operators[i] = operators[i].replace("\\[Pi]", "π");
      operators[i] = operators[i].replace("\\[CapitalPi]", "Π");
      operators[i] = operators[i].replace("\\[Rho]", "ρ");
      operators[i] = operators[i].replace("\\[CapitalRho]", "Ρ");
      operators[i] = operators[i].replace("\\[Sigma]", "σ");
      operators[i] = operators[i].replace("\\[CapitalSigma]", "Σ");
      operators[i] = operators[i].replace("\\[Tau]", "τ");
      operators[i] = operators[i].replace("\\[CapitalTau]", "Τ");
      operators[i] = operators[i].replace("\\[Upsilon]", "υ");
      operators[i] = operators[i].replace("\\[CapitalUpsilon]", "Υ");
      operators[i] = operators[i].replace("\\[Phi]", "ϕ");
      operators[i] = operators[i].replace("\\[CapitalPhi]", "Φ");
      operators[i] = operators[i].replace("\\[Chi]", "χ");
      operators[i] = operators[i].replace("\\[CapitalChi]", "Χ");
      operators[i] = operators[i].replace("\\[Psi]", "ψ");
      operators[i] = operators[i].replace("\\[CapitalPsi]", "Ψ");
      operators[i] = operators[i].replace("\\[Omega]", "ω");
      operators[i] = operators[i].replace("\\[CapitalOmega]", "Ω");
    }
    return operators[0].length ? operators : [];
  }
};

module.exports = {
  createQueryString,
  cleanResponse,
  getMathML,
  getIdentifiers,
  getOperators,
};

const prepQueryString = function (str) {
  if (typeof str === "undefined") {
    return "undefined";
  }

  if (str.length) {
    return encodeURIComponent(str.replace(/\+/g, "%2b").replace(/\&/g, "%26"));
  }

  return "undefined";
};

const prepQuestionDef = function (str) {
  return str
    .replace(/\+/g, "%252b")
    .replace(/\&/g, "%2526")
    .replace(/\^/g, "%255e")
    .replace(/\s/g, "%20")
    .replace(/{/g, "%7B")
    .replace(/}/g, "%7D")
    .replace(/\|/g, "%7C");
};

const prepSessionCode = function (id, studentId) {
  return encodeURIComponent(
    id.replace(/[^0-9a-z]/gi, "") +
      "$" +
      studentId.replace(/[^a-zA-Z0-9]/g, "") +
      "$" +
      dateStamp()
  );
};

// generates a date stamp string for qEval internal logging
// TODO: JVR - This can be replaced with built-in functionality
const dateStamp = function () {
  // get timestamp
  var d = new Date();

  // create datestamp for qEval logging
  var curr_date = d.getDate();
  curr_date = curr_date + "";
  if (curr_date.length == 1) {
    curr_date = "0" + curr_date;
  }
  var curr_month = d.getMonth() + 1;
  curr_month = curr_month + "";
  if (curr_month.length == 1) {
    curr_month = "0" + curr_month;
  }
  var curr_year = d.getFullYear();
  var curr_hour = d.getHours();
  curr_hour = curr_hour + "";
  if (curr_hour.length == 1) {
    curr_hour = "0" + curr_hour;
  }
  var curr_min = d.getMinutes();
  curr_min = curr_min + "";
  if (curr_min.length == 1) {
    curr_min = "0" + curr_min;
  }
  var curr_sec = d.getSeconds();
  curr_sec = curr_sec + "";
  if (curr_sec.length == 1) {
    curr_sec = "0" + curr_sec;
  }
  return (
    "" + curr_date + curr_month + curr_year + curr_hour + curr_min + curr_sec
  );
};
