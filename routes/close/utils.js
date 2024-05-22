const createQueryString = function (request, sessionCode) {
  const { appKey } = request.body;

  const appKeyPart = "?appKey=" + appKey.replace(/\s/g, "");
  const cmdPart = "&cmd=closeSession";
  const sessionCodePart = "&session=" + sessionCode;

  return [appKeyPart, cmdPart, sessionCodePart].join("");
};

function parseResponse(response) {
  // JVR - The closeSession doesnt have any specialized error so leaving
  // this here for future enhancement and consistency.

  return {
    success: true,
  };
}
export { createQueryString, parseResponse };
