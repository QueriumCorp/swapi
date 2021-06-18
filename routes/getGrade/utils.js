const he = require("he");

const createQueryString = function (request, sessionCode) {
  const { appKey } = request.body;

  const appKeyPart = "?appKey=" + appKey.replace(/\s/g, "");
  const cmdPart = "&cmd=getGrade";
  const sessionCodePart = "&session=" + sessionCode;

  return [appKeyPart, cmdPart, sessionCodePart].join("");
};

function parseResponse(response) {
  const delimiter = '"';
  const start = 1;
  let grade = response.split(delimiter).slice(start)[0];

  return {
    success: true,
    grade: grade,
  };
}
module.exports = {
  createQueryString,
  parseResponse,
};
