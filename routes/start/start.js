"use strict";
const fetch = require("node-fetch");

module.exports = async function (fastify, opts) {
  fastify.post("/", function (request, reply) {
    const questionDef = request.body;

    console.info(process.env);
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
