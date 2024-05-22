import { default as fastify } from "fastify";
import fp from "fastify-plugin";
import swaggerPkg from "@fastify/swagger"

export default fp((fastify, opts, next) => {
  fastify.register(swaggerPkg, {
    routePrefix: "/swagger",
    swagger: {
      info: {
        title: "Querium StepWise API",
        description:
          "#Intro This is the API for Querium's AI-based StepWise virtual tutor",
        version: "0.1.0"
      },
      externalDocs: {
        url: "http://www.querium.com",
        description: "Find more info here"
      },
      //host: "qq-stepwise-api.querium.com",
      // ---------------------------------------------------
      // mcdaniel sep-2022: switch to environment variable
      host: process.env.SWAPI_HOST,
      // ---------------------------------------------------
      //
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
