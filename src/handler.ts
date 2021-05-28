import { envVar, isWebhookValid, prettyJson } from "@vertexvis/api-client-node";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import "source-map-support/register";

const WebhookSecret = envVar("WEBHOOK_SECRET");

export function handler(evt: APIGatewayProxyEvent): APIGatewayProxyResult {
  if (!evt.body) return response(400, "Invalid request body.");

  const signature = evt.headers["x-vertex-signature"];
  if (!signature) return response(400, "No signature.");

  if (!isWebhookValid(evt.body, WebhookSecret, signature)) {
    return response(400, "Invalid signature.");
  }

  try {
    const body = JSON.parse(evt.body);
    console.log(
      `Received ${evt.headers["x-vertex-topic"]}: ${prettyJson(body)}`
    );

    // TODO: Take action on the webhook event.

    return response(200, "Success!");
  } catch (e) {
    return response(400, "Invalid body.");
  }
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
