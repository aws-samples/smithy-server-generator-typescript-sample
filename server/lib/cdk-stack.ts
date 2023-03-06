import { StringWizardServiceOperations } from "@smithy-demo/string-wizard-service-ssdk";
import * as cdk from "aws-cdk-lib";
import {
  AccessLogFormat,
  ApiDefinition,
  LogGroupLogDestination,
  MethodLoggingLevel,
  SpecRestApi,
} from "aws-cdk-lib/aws-apigateway";
import { AnyPrincipal, Effect, PolicyDocument, PolicyStatement, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import {Runtime} from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";
import { readFileSync } from "fs";
import * as path from "path";

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const logGroup = new LogGroup(this, "ApiLogs");

    const entry_points: { [op in StringWizardServiceOperations]: string } = {
      Echo: "echo_handler",
      Length: "length_handler",
    };

    const functions = (Object.keys(entry_points) as StringWizardServiceOperations[]).reduce(
      (acc, operation) => ({
        ...acc,
        [operation]: new NodejsFunction(this, operation + "Function", {
          entry: path.join(__dirname, `../dist/src/${entry_points[operation]}.js`),
          handler: "lambdaHandler",
          runtime: Runtime.NODEJS_18_X,
          bundling: {
            minify: true,
            tsconfig: path.join(__dirname, "../tsconfig.json"),
            // re2-wasm is used by the SSDK common library to do pattern validation, and uses
            // a WASM module, so it's excluded from the bundle
            nodeModules: ["re2-wasm"],

            // Enable these for easier debugging, though they will increase your artifact size
            // sourceMap: true,
            // sourceMapMode: SourceMapMode.INLINE
          },
        }),
      }),
      {}
    ) as { [op in StringWizardServiceOperations]: NodejsFunction };

    const api = new SpecRestApi(this, "StringWizardApi", {
      apiDefinition: ApiDefinition.fromInline(this.getOpenApiDef(functions)),
      deploy: true,
      deployOptions: {
        accessLogDestination: new LogGroupLogDestination(logGroup),
        accessLogFormat: AccessLogFormat.jsonWithStandardFields(),
        loggingLevel: MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        metricsEnabled: true,
      },
      policy: new PolicyDocument({
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [new AnyPrincipal()],
            actions: ["execute-api:Invoke"],
            resources: ["execute-api:/*/*/*"],
          }),
        ],
      }),
    });

    for (const [k, v] of Object.entries(functions)) {
      v.addPermission(`${k}Permission`, {
        principal: new ServicePrincipal("apigateway.amazonaws.com"),
        sourceArn: `arn:${this.partition}:execute-api:${this.region}:${this.account}:${api.restApiId}/*/*/*`,
      });
    }
  }

  private getOpenApiDef(functions: { [op in StringWizardServiceOperations]?: NodejsFunction }) {
    const openapi = JSON.parse(
      readFileSync(
        path.join(__dirname, "../codegen/build/smithyprojections/server-codegen/apigateway/openapi/StringWizard.openapi.json"),
        "utf8"
      )
    );
    for (const path in openapi.paths) {
      for (const operation in openapi.paths[path]) {
        const op = openapi.paths[path][operation];
        const integration = op["x-amazon-apigateway-integration"];
        // Don't try to mess with mock integrations
        if (integration !== null && integration !== undefined && integration["type"] === "mock") {
          continue;
        }
        const functionArn = functions[op.operationId as StringWizardServiceOperations]?.functionArn;
        if (functionArn === null || functionArn === undefined) {
          throw new Error("no function for " + op.operationId);
        }
        if (!op["x-amazon-apigateway-integration"]) {
          throw new Error(
              `No x-amazon-apigateway-integration for ${op.operationId}. Make sure API Gateway integration is configured in codegen/model/apigateway.smithy`
          );
        }
        op[
          "x-amazon-apigateway-integration"
        ].uri = `arn:${this.partition}:apigateway:${this.region}:lambda:path/2015-03-31/functions/${functionArn}/invocations`;
      }
    }
    return openapi;
  }
}
