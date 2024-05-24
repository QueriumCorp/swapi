// Documentation on defining a Fastify JSONSchema
// https://www.fastify.io/docs/v2.2.x/Validation-and-Serialization/
// https://json-schema.org

const bodySchema = {
  type: "object",
  required: ["appKey", "sessionToken", "schema"],
  properties: {
    appKey: {
      description: "The unique identifier for your application",
      type: "string",
    },
    sessionToken: {
      description:
        "The unique identifier for this session. Typically includes a student id and timestamp",
      type: "string",
    },
    equation: {
      description: "The schema equation",
      type: "string",
    },
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

const schema = {
  tags: ["Submit Organize"],
  body: bodySchema,
  querystring: queryStringSchema,
  params: paramsSchema,
  headers: headersSchema,
  response: responseSchema,
};

export default schema;
