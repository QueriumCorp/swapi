const createQueryString = function (request, sessionCode) {
  const { appKey } = request.body;

  const appKeyPart = "?appKey=" + appKey.replace(/\s/g, "");
  const cmdPart = "getGeneralHints&preCompute=1";
  const sessionCodePart = "&session=" + sessionCode;

  return [appKeyPart, cmdPart, sessionCodePart].join("");
};

const parseResponse = function (response) {
  if (!response || !response.length || response.indexOf("network error") > -1) {
    return {
      success: false,
    };
  }

  console.info(response);
  return {
    success: true,
  };
};

export { createQueryString, parseResponse };
