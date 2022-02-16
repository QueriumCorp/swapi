"use strict";
const fetch = require("node-fetch");
const schema = require("./schema");
const {
  createQueryString: createQueryStringSubmitStep,
  parseResponse: parseResponseSubmitStep
} = require("../submitStep/utils");
const {
  createQueryString: createQueryStringGetHint,
  parseResponse: parseResponseGetHint,
  handleFetch: handleFetchHint
} = require("../getHint/utils");

module.exports = async function(fastify, opts) {
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

      const queryString = await createQueryStringSubmitStep(
        request,
        sessionCode
      );
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
      const resultStep = parseResponseSubmitStep(cleansed);

      if (resultStep.stepStatus !== "INVALID") {
        return {
          status: 200,
          stepStatus: resultStep.stepStatus,
          message: resultStep.message,
          rawResponse: data
        };
      }

      // On the INVALID step, make getHint request to qEval
      // Create & Fetch
      const queryStringHint = await createQueryStringGetHint(
        request,
        sessionCode
      );
      const fullUrlHint = serverInfo.url + queryStringHint;
      let dataHint = await handleFetchHint(fullUrlHint, queryStringHint);

      // Check for a bad response from qEval
      if (dataHint instanceof Error) {
        return dataHint;
      }

      // Check for ghost hints
      if (dataHint.search(/ghost hint/i) !== -1) {
        dataHint = await handleFetchHint(fullUrlHint, queryStringHint);

        // Check for a bad response from qEval
        if (dataHint instanceof Error) {
          return dataHint;
        }
      }

      // Sanitize the response for our protection
      const cleansedHint = fastify.cleanResponse(dataHint);
      const resultHint = parseResponseGetHint(cleansedHint);

      // Check for a bad response from qEval
      if (!resultHint.success) {
        const error = new Error("There was an error in the StepWise Server");
        error.statusCode = responseHint.status;
        error.message =
          "The getHint command failed.There was an error in the StepWise Server";
        error.details = queryStringHint;
        return error;
      }

      return {
        status: 200,
        stepStatus: resultStep.stepStatus,
        message: resultHint.hintText,
        rawResponse: data
      };
    }
  });
};
