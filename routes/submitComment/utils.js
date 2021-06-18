const he = require("he");

const createQueryString = function (request, sessionCode) {
  const { appKey, comment } = request.body;

  const appKeyPart = "?appKey=" + appKey.replace(/\s/g, "");
  const cmdPart = "&cmd=addComment";
  const sessionCodePart = "&session=" + sessionCode;
  const commentPart = "&comment=" + comment;

  return [appKeyPart, cmdPart, sessionCodePart, commentPart].join("");
};

function parseResponse(response) {
  // JVR - The addComment doesnt have any specialized error so leaving
  // this here for future enhancement and consistency.

  return {
    success: true,
  };
}
module.exports = {
  createQueryString,
  parseResponse,
};
