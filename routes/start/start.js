"use strict";
import fetch from "node-fetch";
import schema from "./schema.js";
import {
  getMathML,
  getIdentifiers,
  getOperators,
  createQueryString,
} from "./utils.js";

export default async function (fastify, opts) {
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

      // Acquire an Ai server
      const serverInfo = await fastify.getServerURL();
      fastify.log.info(JSON.stringify(serverInfo));

      // Create the sessionCode for this session
      const { studentId, id } = request.body;
      const { sessionCode, sessionToken } = await fastify.prepSessionInfo(
        id,
        studentId,
        serverInfo.name
      );

      // Create & Fetch
      const queryString = await createQueryString(sessionCode, request);
      const fullURL = serverInfo.url + queryString;
      console.log(fullURL);
      let response = await fetch(fullURL);

      // Check for a bad response from qEval
      if (response.status !== 200) {
        const error = new Error("There was an error in the StepWise Server");
        error.status = response.status;
        error.statusText = response.statusText;
        fastify.log.info(JSON.stringify(error));
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
        sessionToken: sessionToken,
        sessionCode: sessionCode,
        mathML: mathML,
        identifiers: ids,
        operators: ops,
      };
    },
  });
}
