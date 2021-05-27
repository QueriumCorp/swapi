"use strict";
const fetch = require("node-fetch");
const schema = require("./schema");
const {
  getMathML,
  getIdentifiers,
  getOperators,
  createQueryString,
} = require("./utils");

module.exports = async function (fastify, opts) {
  fastify.route({
    method: "POST",
    url: "/",
    schema: schema,
    handler: async (request, reply) => {
      // See if appkey is approved
      if (!(await fastify.validAppKey(request.body.appKey))) {
        const error = new Error("Access to StepWise is forbidden.");
        error.status = 403;
        error.statusText = "Forbidden";
        return error;
      }

      // Create the sessionCode for this session
      const { studentId, id } = request.body;
      const sessionCode = await fastify.createSessionCode(id, studentId);

      // Create & Fetch
      const serverURL = await fastify.getServerURL();

      const queryString = await createQueryString(sessionCode, request);
      const fullURL = serverURL + queryString;
      let response = await fetch(fullURL);

      // Check for a bad response from qEval
      if (response.status !== 200) {
        const error = new Error("There was an error in the StepWise Server");
        error.status = response.status;
        error.statusText = response.statusText;
        return error;
      }

      // Sanitize the response for our protection
      let data = await response.text();
      const result = fastify.cleanResponse(data);

      // Get the mathML, identifiers and operators
      const mathML = getMathML(result);
      const ids = getIdentifiers(result);
      const ops = getOperators(result);

      return {
        status: 200,
        sessionCode: sessionCode,
        mathML: mathML,
        identifiers: ids,
        operators: ops,
      };
    },
  });
};
