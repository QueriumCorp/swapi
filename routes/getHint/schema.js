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
      hintText: { type: "string" },
      hintObject: {
        type: "array",
        items: {
          type: "object",
          properties: {
            tag: {
              type: "string",
              enum: ["HINT", "ERROR"],
            },
            type: { type: "string" },
            message: { type: "string" },
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
      details: { type: "string" },
    },
  },
};

const schema = {
  tags: ["Get Hint"],
  body: bodySchema,
  querystring: queryStringSchema,
  params: paramsSchema,
  headers: headersSchema,
  response: responseSchema,
};

export default schema;
