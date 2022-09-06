const { default: fastify } = require("fastify");
const fp = require("fastify-plugin");

module.exports = fp((fastify, opts, next) => {
  fastify.register(require("fastify-swagger"), {
    routePrefix: "/swagger",
    swagger: {
      info: {
        title: "Querium StepWise API",
        description:
          "#Intro This is the API for Querium's AI-based StepWise virtual tutor",
        version: "0.2.0"
      },
      externalDocs: {
        url: "http://www.querium.com",
        description: "Find more info here"
      },
      host: "dev.qq-stepwise-api.querium.com",
      schemes: ["https", "http"],
      consumes: ["application/json"],
      produces: ["application/json"]
    },
    uiConfig: {
      docExpansion: "full",
      deepLinking: false
    },
    staticCSP: true,
    transformStaticCSP: header => header,
    exposeRoute: true
  });

  next();
});
