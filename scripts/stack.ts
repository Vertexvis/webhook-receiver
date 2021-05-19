import { App, Duration, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  aws_apigateway as apigateway,
  aws_lambda as lambda,
  aws_lambda_nodejs as lambdaNodeJs,
} from "aws-cdk-lib";
import { join } from "path";
import { envVar } from "@vertexvis/api-client-node";

interface Props extends StackProps {
  readonly stage: string;
  readonly webhookSecret: string;
}

interface Name {
  readonly id: string;
  readonly name: string;
}

export const Project = "webhook-receiver";

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
    kebabCaseName: string,
    args: lambdaNodeJs.NodejsFunctionProps
  ): lambdaNodeJs.NodejsFunction {
    const names = this.stackResourceName(kebabCaseName, "func");
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

  private stackResourceName(kebabCaseName: string, resource: string): Name {
    return {
      id: stackId(kebabCaseName, resource),
      name: `${kebabCaseName}-${this.region}`,
    };
  }
}

function capitalize(s: string): string {
  return `${s.charAt(0).toUpperCase()}${s.slice(1)}`;
}

function kebabToCamel(kebab: string): string {
  return kebab.replace(/-./g, (s) => s[1].toUpperCase());
}

function stackId(kebabCaseName: string, resource: string): string {
  return capitalize(`${kebabToCamel(kebabCaseName)}${capitalize(resource)}`);
}

async function main(): Promise<void> {
  const AwsProfile = envVar("AWS_PROFILE");

  new WebhookStack(new App(), stackId(Project, "stack"), {
    env: {
      account: process.env.CDK_DEPLOY_ACCOUNT ?? envVar("CDK_DEFAULT_ACCOUNT"),
      region: process.env.CDK_DEPLOY_REGION ?? envVar("CDK_DEFAULT_REGION"),
    },
    webhookSecret: envVar("WEBHOOK_SECRET"),
    stage: AwsProfile,
    tags: {
      Creator: "cdk",
      Environment: AwsProfile,
      Project: Project,
      Revision: envVar("GIT_SHORT_REV"),
    },
  });
}

main();
