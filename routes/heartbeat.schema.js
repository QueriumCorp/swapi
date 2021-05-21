// Documentation on defining a Fastify JSONSchema
// https://www.fastify.io/docs/v2.2.x/Validation-and-Serialization/
// https://json-schema.org

const bodySchema = {};

const queryStringSchema = {};
const paramsSchema = {};
const headersSchema = {};
const responseSchema = {
  200: {
    type: "object",
    properties: {
      status: { type: "string" },
      timestamp: { type: "string", format: "date-time" },
    },
  },
};

module.exports = {
  tags: ["Heartbeat"],
  body: bodySchema,
  querystring: queryStringSchema,
  params: paramsSchema,
  headers: headersSchema,
  response: responseSchema,
};
