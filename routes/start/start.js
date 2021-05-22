"use strict";
const fetch = require("node-fetch");

const schema = require("./start.schema");
const {
  prepQueryString,
  prepQuestionDef,
  prepSessionCode,
} = require("./start.utils");

module.exports = async function (fastify, opts) {
  fastify.route({
    method: "POST",
    url: "/",
    schema: schema,
    handler: (request, reply) => {
      // Warning: qEval does case-sensitive replacement of percent escapes,
      // and expects lower case letters e.g. %2b NOT %2B
      const {
        appKey,
        studentId,
        id,
        title,
        stimulus,
        topic,
        definition,
        policy,
        hints,
      } = request.body;

      const appKeyPart = "?appKey=" + appKey;
      const cmdPart = "&cmd=initializeSession";
      const sessionCodePart =
        "&session=" + prepSessionCode(id, appKey, studentId, definition);
      const classCodePart = "&class=" + encodeURIComponent(topic);
      const questionPart = "&question=" + prepQuestionDef(definition);
      const policyPart = "&policies=" + prepQueryString(policy);
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

      const url = process.env.SWSERVER + urlParts.join("");
      console.info(url);

      const remoteURL = url; //"https://jsonplaceholder.typicode.com/todos/1";
      fetch(remoteURL)
        .then((response) => response.text())
        .then((data) => {
          console.log(data);
          const payload = {
            title: data.title,
            completed: data.completed,
          };
          reply.status(200).send(payload);
        })
        .catch((err) => {
          console.error(err);
          reply.status(500).send(err);
        });
    },
  });
};
