import { envVar, prettyJson } from "@vertexvis/api-client-node";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createHmac } from "crypto";
import "source-map-support/register";

const WEBHOOK_SECRET = envVar("WEBHOOK_SECRET");

export function handler(evt: APIGatewayProxyEvent): APIGatewayProxyResult {
  if (!evt.body) {
    return response(400, "Invalid request body.");
  }

  const signature = evt.headers["x-vertex-signature"];
  if (!signature) {
    return response(400, "No signature.");
  }

  if (!isSignatureValid(evt.body, signature)) {
    return response(400, "Invalid signature.");
  }

  try {
    const body = JSON.parse(evt.body);
    console.log(
      `Received ${evt.headers["x-vertex-topic"]}: ${prettyJson(body)}`
    );

    return response(200, "Success!");
  } catch (e) {
    return response(400, "Invalid body.");
  }
}

export function isSignatureValid(body: string, signature: string): boolean {
  return (
    signature ===
    createHmac("sha256", WEBHOOK_SECRET).update(body).digest("hex")
  );
}

export function response(
  statusCode: number,
  message: string
): APIGatewayProxyResult {
  return {
    body: JSON.stringify({ message }),
    statusCode,
  };
}

process.on("unhandledRejection", (e) => console.error("unhandledRejection", e));
