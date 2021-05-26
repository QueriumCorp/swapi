// Documentation on defining a Fastify JSONSchema
// https://www.fastify.io/docs/v2.2.x/Validation-and-Serialization/
// https://json-schema.org

const bodySchema = {
  type: "object",
  required: ["appKey", "studentId", "id", "topic", "definition"],
  properties: {
    appKey: { type: "string" },
    studentId: { type: "string" },
    id: { type: "string" },
    step: { type: "string" },
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
      text: { type: "string" },
      response: { type: "object" },
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
  tags: ["Submit Step"],
  body: bodySchema,
  querystring: queryStringSchema,
  params: paramsSchema,
  headers: headersSchema,
  response: responseSchema,
};
