import { envVar } from "@vertexvis/api-client-node";
import {
  App,
  Duration,
  Stack,
  StackProps,
  aws_apigateway as apigateway,
  aws_lambda as lambda,
  aws_lambda_nodejs as lambdaNodeJs,
} from "aws-cdk-lib";
import { camelCase } from "camel-case";
import { Construct } from "constructs";
import { join } from "path";
import { upperCaseFirst } from "upper-case-first";

interface Props extends StackProps {
  readonly stage: string;
  readonly webhookSecret: string;
}

interface Name {
  readonly id: string;
  readonly name: string;
}

const Project = "webhook-receiver";

export class WebhookStack extends Stack {
  private stage: string;

  public constructor(scope: Construct, id: string, props: Props) {
    super(scope, id, props);
    this.stage = props.stage;

    const func = this.lambda(Project, {
      entry: join(__dirname, "..", "src", "handler.ts"),
      environment: {
        WEBHOOK_SECRET: props.webhookSecret,
        STAGE: this.stage,
      },
      timeout: Duration.seconds(15),
    });

    const names = this.stackResourceName(Project, "api");
    new apigateway.RestApi(this, names.id, {
      restApiName: names.name,
    }).root.addMethod("POST", new apigateway.LambdaIntegration(func));
  }

  private lambda(
    name: string,
    args: lambdaNodeJs.NodejsFunctionProps
  ): lambdaNodeJs.NodejsFunction {
    const names = this.stackResourceName(name, "func");
    return new lambdaNodeJs.NodejsFunction(this, names.id, {
      bundling: { minify: true, sourceMap: true },
      environment: args.environment,
      functionName: names.name,
      handler: "handle",
      logRetention: 7,
      runtime: lambda.Runtime.NODEJS_14_X,
      ...args,
    });
  }

  private stackResourceName(name: string, resource: string): Name {
    return {
      id: stackId(name, resource),
      name: `${name}-${this.region}`,
    };
  }
}

function stackId(name: string, resource: string): string {
  return upperCaseFirst(`${camelCase(name)}${upperCaseFirst(resource)}`);
}

function main(): void {
  const stage = envVar("STAGE");

  new WebhookStack(new App(), stackId(Project, "stack"), {
    env: {
      region: process.env.AWS_REGION ?? envVar("CDK_DEFAULT_REGION"),
    },
    webhookSecret: envVar("WEBHOOK_SECRET"),
    stage,
    tags: {
      Creator: "cdk",
      Environment: stage,
      Project: Project,
      Revision: envVar("GIT_SHORT_REV"),
    },
  });
}

main();
