"use strict";
const fetch = require("node-fetch");
const schema = require("./start.schema");
const {
  cleanResponse,
  getMathML,
  getIdentifiers,
  getOperators,
  create_WebMMA_url,
} = require("./start.utils");

module.exports = async function (fastify, opts) {
  fastify.route({
    method: "POST",
    url: "/",
    schema: schema,
    handler: async (request, reply) => {
      let response = await fetch(create_WebMMA_url(request));
      let data = await response.text();
      const result = cleanResponse(data);

      // get the mathML, identifiers and operators
      const mathML = getMathML(result);
      const ids = getIdentifiers(result);
      const ops = getOperators(result);

      const payload = {
        status: 200,
        mathML: mathML,
        identifiers: ids,
        operators: ops,
      };
      console.info("payload:", payload);

      return payload;
      // })
      // .catch((err) => {
      //   console.error(err);
      //   reply.status(500).send(err);
      // });
    },
  });
};
