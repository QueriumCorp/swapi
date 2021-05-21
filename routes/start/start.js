"use strict";
const fetch = require("node-fetch");

const { bodySchema } = require("./start.schema");

module.exports = async function (fastify, opts) {
  fastify.post("/", function (request, reply) {
    const { qqKey, sessionCode, student, problemClass, problemDef, policy } =
      request.body;
    let { qs1, qs2, qs3 } = request.body;

    const qEvalServer = process.env.SWSERVER;

    qs1 = typeof qs1 === "undefined" ? "" : qs1;
    qs2 = typeof qs2 === "undefined" ? "" : qs2;
    qs3 = typeof qs3 === "undefined" ? "" : qs3;

    /* Warning: qEval does case-sensitive replacement of percent escapes, and expects lower case letters e.g. %2b NOT %2B */
    // const url =
    //   qEvalServer +
    //   "?appKey=" +
    //   qqKey +
    //   "&cmd=initializeSession" +
    //   "&session=" +
    //   encodeURIComponent(sessionCode) +
    //   "&class=" +
    //   encodeURIComponent(problemClass) +
    //   "&question=" +
    //   problemDef
    //     .replace(/\+/g, "%252b")
    //     .replace(/\&/g, "%2526")
    //     .replace(/\^/g, "%255e")
    //     .replace(/{/g, "%7b")
    //     .replace(/}/g, "%7d")
    //     .replace(/\|/g, "%7c") +
    //   "&policies=" +
    //   (policy.length
    //     ? encodeURIComponent(policy.replace(/\+/g, "%2b").replace(/\&/g, "%26"))
    //     : "undefined") +
    //   "&qs1=" +
    //   (qs1.length
    //     ? encodeURIComponent(qs1.replace(/\+/g, "%2b").replace(/\&/g, "%26"))
    //     : "undefined") +
    //   "&qs2=" +
    //   (qs2.length
    //     ? encodeURIComponent(qs2.replace(/\+/g, "%2b").replace(/\&/g, "%26"))
    //     : "undefined") +
    //   "&qs3=" +
    //   (qs3.length
    //     ? encodeURIComponent(qs3.replace(/\+/g, "%2b").replace(/\&/g, "%26"))
    //     : "undefined");

    const remoteURL = "https://jsonplaceholder.typicode.com/todos/1";
    fetch(remoteURL)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        const payload = {
          title: data.title,
          completed: data.completed,
        };
        reply.status(200).send(payload);
      })
      .catch((err) => {
        console.log(err);
        reply.status(500).send(err);
      });
  });
};
