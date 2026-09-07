"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function ReactSwagger({ spec }) {
  return <SwaggerUI spec={spec} />;
}