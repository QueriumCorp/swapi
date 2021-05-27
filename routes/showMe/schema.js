// Documentation on defining a Fastify JSONSchema
// https://www.fastify.io/docs/v2.2.x/Validation-and-Serialization/
// https://json-schema.org

const bodySchema = {
  type: "object",
  required: ["appKey", "sessionCode", "studentId", "id"],
  properties: {
    appKey: { type: "string" },
    sessionCode: { type: "string" },
    studentId: { type: "string" },
    id: { type: "string" },
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
      showMe: {
        type: "array",
        items: {
          type: "object",
          properties: {
            suggestedStep: { type: "string" },
            instruction: { type: "string" },
          },
        },
      },
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
  tags: ["Show Me"],
  body: bodySchema,
  querystring: queryStringSchema,
  params: paramsSchema,
  headers: headersSchema,
  response: responseSchema,
};
