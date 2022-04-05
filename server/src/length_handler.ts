import { getLengthHandler } from "@smithy-demo/string-wizard-service-ssdk";
import { APIGatewayProxyHandler } from "aws-lambda";
import { LengthOperation } from "./length";
import { getApiGatewayHandler } from "./apigateway";

// This is the entry point for the Lambda Function that services the LengthOperation
export const lambdaHandler: APIGatewayProxyHandler = getApiGatewayHandler(getLengthHandler(LengthOperation));
