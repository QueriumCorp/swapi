"use strict";
const fetch = require("node-fetch");
const schema = require("./schema");
const { createQueryString, parseResponse } = require("./utils");

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

      let data = await response.text();

      // Check for ghost hints
      if (data.search(/ghost hint/i) !== -1) {
        response = await fetch(fullURL);

        // Check for a bad response from qEval
        if (response.status !== 200) {
          const ghostError = new Error(
            "There was an error in the StepWise Server"
          );
          ghostError.statusCode = response.status;
          ghostError.error = "There was an error in the StepWise Server";
          ghostError.message = response.statusText;
          ghostError.details = queryString;
          return ghostError;
        }

        data = await response.text();
      }

      // Sanitize the response for our protection
      const cleansed = fastify.cleanResponse(data);

      // Validate if the request is completed in time
      if (!fastify.didCompleteInTime(cleansed)) {
        const error = new Error(
          "The system has timed out; please retry the question in 5 minutes");
        error.status = 504;
        return error;
      }

      const result = parseResponse(cleansed);

      // Check for a bad response from qEval
      if (!result.success) {
        const error = new Error("There was an error in the StepWise Server");
        error.statusCode = response.status;
        error.message =
          "The getHint command failed. There was an error in the StepWise Server";
        error.details = queryString;
        return error;
      }
      return {
        status: 200,
        hintText: result.hintText,
        hintObject: result.hintObject
      };
    }
  });
};
