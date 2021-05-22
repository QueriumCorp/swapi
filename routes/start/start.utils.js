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
  return encodeURIComponent(
    str
      .replace(/\+/g, "%252b")
      .replace(/\&/g, "%2526")
      .replace(/\^/g, "%255e")
      .replace(/{/g, "%7b")
      .replace(/}/g, "%7d")
      .replace(/\|/g, "%7c")
  );
};

const prepSessionCode = function (id, appKey, studentId, definition) {
  return encodeURIComponent(id ? id : appKey + studentId + definition);
};

module.exports = {
  prepQueryString,
  prepQuestionDef,
  prepSessionCode,
};
