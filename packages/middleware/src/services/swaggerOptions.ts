import { jsonSchemaTransform } from "fastify-type-provider-zod";
import type { FastifyDynamicSwaggerOptions } from "@fastify/swagger";

const swaggerOptions: FastifyDynamicSwaggerOptions = {
  openapi: {
    info: {
      title: "Docs title",
      description: "Docs description",
      version: "0.0.0",
    },
    servers: [{
      url: "http://localhost:3001",
    }],
  },
  transform: jsonSchemaTransform,
};

export default swaggerOptions;
