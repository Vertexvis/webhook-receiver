# webhook-receiver

This example shows how to verify a Vertex webhook's payload with the `x-vertex-signature` header.

## Webhook Receiver

This example is deployed as an [AWS Lambda](https://aws.amazon.com/lambda/) function via the [AWS CDK](https://aws.amazon.com/cdk/). The stack defined at `./scripts/stack.ts`. You can deploy one to your AWS account as follows,

1. Clone the repository and install dependencies with `yarn install`
1. Using your `WEBHOOK_SECRET`, Run `WEBHOOK_SECRET=[YOUR_WEBHOOK_SECRET] yarn deploy` to create the Lambda function. After the deploy, a publicly accessible HTTP endpoint is logged to the console.
1. Once you have created a webhook subscription and initiated an event that triggers one, check your Lambda function's logs for `Received ..., body=...`
1. [Optional] Remove the AWS resources, `yarn destroy`
