const createQueryString = function (request, sessionCode) {
  const { appKey, comment } = request.body;

  const appKeyPart = "?appKey=" + appKey.replace(/\s/g, "");
  const cmdPart = "&cmd=saveTrace";
  const sessionCodePart = "&session=" + sessionCode;
  const commentPart = "&comment=" + comment;

  return [appKeyPart, cmdPart, sessionCodePart, commentPart].join("");
};

function parseResponse(response) {
  // JVR - The saveTrace doesnt have any specialized error so leaving
  // this here for future enhancement and consistency.

  return {
    success: true,
  };
}
export { createQueryString, parseResponse };
