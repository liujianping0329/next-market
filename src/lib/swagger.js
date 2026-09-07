import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = () => {
  return createSwaggerSpec({
    apiFolder: "src/app/api/external",
    autoDoc: true,

    definition: {
      openapi: "3.0.0",
      info: {
        title: "Next Market API",
        version: "1.0.0",
        description: "Next Market 外部 API",
      },
    },
  });
};