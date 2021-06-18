// Documentation on defining a Fastify JSONSchema
// https://www.fastify.io/docs/v2.2.x/Validation-and-Serialization/
// https://json-schema.org

const bodySchema = {
  type: "object",
  required: ["appKey", "sessionToken"],
  properties: {
    appKey: { type: "string" },
    sessionToken: { type: "string" },
  },
};

const queryStringSchema = {};
const paramsSchema = {};
const headersSchema = {};
const responseSchema = {
  200: {
    type: "object",
    properties: {
      status: { type: "string" },
    },
  },
  500: {
    type: "object",
    properties: {
      statusCode: { type: "string" },
      error: { type: "string" },
      message: { type: "string" },
    },
  },
};

module.exports = {
  tags: ["Close"],
  body: bodySchema,
  querystring: queryStringSchema,
  params: paramsSchema,
  headers: headersSchema,
  response: responseSchema,
};
