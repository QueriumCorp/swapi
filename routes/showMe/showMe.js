"use strict";
import fetch from "node-fetch";
import schema from "./schema.js";
import { createQueryString, parseResponse } from "./utils.js";

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

      // Decode sessionToken
      const sessionCode = fastify.createSessionCode(request.body.sessionToken);

      // Create & Fetch
      const serverInfo = await fastify.convertNameToUrl(
        request.body.sessionToken
      );
      if (!serverInfo.status) {
        const error = new Error(serverInfo.msg);
        error.status = 404;
        error.statusText = "Not Found";
        return error;
      }
      const queryString = await createQueryString(request, sessionCode);
      const fullURL = serverInfo.url + queryString;
      let response = await fetch(fullURL);

      // Check for a bad response from qEval
      if (response.status !== 200) {
        const error = new Error("There was an error in the StepWise Server");
        error.statusCode = response.status;
        error.error = "There was an error in the StepWise Server";
        error.message = response.statusText;
        error.details = queryString;
        return error;
      }

      // Sanitize the response for our protection
      let data = await response.text();
      const cleansed = fastify.cleanResponse(data);
      const result = parseResponse(cleansed);
      // Check for a bad response from qEval
      if (!result.success) {
        const error = new Error("There was an error in the StepWise Server");
        error.statusCode = response.status;
        error.message =
          "The showMe command failed.There was an error in the StepWise Server";
        error.details = queryString;
        return error;
      }

      return {
        status: 200,
        showMe: result.instructions,
      };
    },
  });
}
