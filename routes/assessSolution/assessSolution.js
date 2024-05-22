"use strict";
import schema from "./schema.js";

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

      const unImpError = new Error("Assess Solution is not available.");
      unImpError.status = 403;
      unImpError.statusText = "Unimplemented";
      return unImpError;

      // Decode sessionToken
      const sessionCode = fastify.createSessionCode(request.body.sessionToken);

      // // Create & Fetch
      // const serverInfo = await fastify.convertNameToUrl(
      //   request.body.sessionToken
      // );
      // if (!serverInfo.status) {
      //   const error = new Error(serverInfo.msg);
      //   error.status = 404;
      //   error.statusText = "Not Found";
      //   return error;
      // }
      // const queryString = await createQueryString(request, sessionCode);
      // const fullURL = serverInfo.url + queryString;
      // let response = await fetch(fullURL);

      // // Check for a bad response from qEval
      // if (response.status !== 200) {
      //   const error = new Error("There was an error in the StepWise Server");
      //   error.status = response.status;
      //   error.statusText = response.statusText;
      //   return error;
      // }

      // // Sanitize the response for our protection
      // let data = await response.text();
      // const result = cleanResponse(data);

      // // Get the mathML, identifiers and operators
      // const mathML = getMathML(result);
      // const ids = getIdentifiers(result);
      // const ops = getOperators(result);

      // return {
      //   status: 200,
      //   mathML: mathML,
      //   identifiers: ids,
      //   operators: ops,
      // };
    },
  });
}
