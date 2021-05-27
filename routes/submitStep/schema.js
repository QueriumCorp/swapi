// Documentation on defining a Fastify JSONSchema
// https://www.fastify.io/docs/v2.2.x/Validation-and-Serialization/
// https://json-schema.org

const bodySchema = {
  type: "object",
  required: ["appKey", "sessionCode", "studentId", "id", "step"],
  properties: {
    appKey: { type: "string" },
    sessionCode: { type: "string" },
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
      stepStatus: {
        type: "string",
        enum: ["VALID", "INVALID", "COMPLETE", "EXPIRED", "ERROR"],
      },
      message: { type: "string" },
      rawResponse: { type: "string" },
    },
  },
  500: {
    type: "object",
    properties: {
      statusCode: { type: "string" },
      error: { type: "string" },
      message: { type: "string" },
      details: { type: "string" },
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
