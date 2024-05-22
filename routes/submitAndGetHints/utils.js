import {
  containsAnyTagsQ,
  parseResponse as parseResponseGetHint,
} from "../getHint/utils.js";

const hintsInResponse = (data) => {
  const tags = ["[FBMSG:END]", "[HINTMSG:END]", "[ERRMSG:END]"];
  const gotHintsQ = containsAnyTagsQ(data, tags);

  if (!gotHintsQ) {
    return {
      containsHintsQ: false,
      feedback: "",
      content: data,
    };
  }

  const parsedData = parseResponseGetHint(data);
  if (!parsedData.success) {
    return {
      containsHintsQ: true,
      feedback: "",
      content: parsedData,
    };
  }

  const fb = parsedData.hintObject.filter((i) => i.tag === "FB");
  const fbMsg = fb.length > 0 ? fb[0].message : "";
  const hintArr = parsedData.hintObject.filter((i) => i.tag !== "FB");

  return {
    containsHintsQ: true,
    feedback: fbMsg,
    content: {
      success: parsedData.success,
      hintText: hintArr.map((i) => i.message).join(" "),
      hintObject: hintArr,
    },
  };
};

export { hintsInResponse };
