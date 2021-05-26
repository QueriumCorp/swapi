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
    title: { type: "string" },
    stimulus: { type: "string" },
    topic: {
      type: "string",
      enum: ["gradeBasicAlgebra", "gradeBasicCalculus"],
    },
    definition: { type: "string", minLength: 5 },
    hints: { type: "array", maxItems: 3, items: { type: "string" } },
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
      mathML: { type: "string" },
      identifiers: { type: "array", items: { type: "string" } },
      operators: { type: "array", items: { type: "string" } },
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
  tags: ["Start Session"],
  body: bodySchema,
  querystring: queryStringSchema,
  params: paramsSchema,
  headers: headersSchema,
  response: responseSchema,
};
