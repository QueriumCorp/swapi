// Documentation on defining a Fastify JSONSchema
// https://www.fastify.io/docs/v2.2.x/Validation-and-Serialization/

const bodySchema = {
  type: "object",
  required: ["studentId", "id", "topic", "definition"],
  properties: {
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

module.exports = {
  body: bodySchema,
  querystring: queryStringSchema,
  params: paramsSchema,
  headers: headersSchema,
};
