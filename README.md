# webhook-receiver

This example shows how to verify a Vertex webhook's payload with the `x-request-signature-sha-256` header.

## Setup

This example is deployed as an [AWS Lambda](https://aws.amazon.com/lambda/) function via the [AWS CDK](https://aws.amazon.com/cdk/). You can deploy one to your AWS account as follows,

1. Clone the repository and install dependencies with `yarn install`
1. Export environment variables for your Vertex `WEBHOOK_SECRET`.
1. Run `yarn deploy` to create the Lambda function. After the deploy, a publicly accessible HTTP endpoint is logged to the console.
1. Once you have created a webhook subscription and initiated an event that triggers one, check your Lambda function's logs for `Received ..., body=...`
1. [Optional] Remove the AWS resources, `yarn destroy`
