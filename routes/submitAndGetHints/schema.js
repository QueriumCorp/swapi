// Documentation on defining a Fastify JSONSchema
// https://www.fastify.io/docs/v2.2.x/Validation-and-Serialization/
// https://json-schema.org

const bodySchema = {
  type: "object",
  required: ["appKey", "sessionToken", "step"],
  properties: {
    appKey: { type: "string" },
    sessionToken: { type: "string" },
    step: { type: "string" }
  }
};

const queryStringSchema = {};
const paramsSchema = {};
const headersSchema = {};
const responseSchema = {
  200: {
    type: "object",
    properties: {
      status: { type: "string" },
      stepStatus: {
        type: "string",
        enum: ["VALID", "INVALID", "COMPLETE", "EXPIRED", "ERROR"]
      },
      message: { type: "string" },
      rawResponse: { type: "string" },
      hintObject: {
        type: "array",
        items: {
          type: "object",
          properties: {
            tag: {
              type: "string",
              enum: ["HINT", "ERROR"]
            },
            type: { type: "string" },
            message: { type: "string" }
          }
        },
      },
    }
  },
  500: {
    type: "object",
    properties: {
      statusCode: { type: "string" },
      error: { type: "string" },
      message: { type: "string" },
      details: { type: "string" }
    }
  }
};

module.exports = {
  tags: ["Submit Step"],
  body: bodySchema,
  querystring: queryStringSchema,
  params: paramsSchema,
  headers: headersSchema,
  response: responseSchema
};
