import { Operation } from "@aws-smithy/server-common";
import { EchoServerInput, EchoServerOutput, PalindromeException } from "@smithy-demo/string-wizard-service-ssdk";
import { HandlerContext } from "./apigateway";
import { reverse } from "./util";

// This is the implementation of business logic of the EchoOperation
export const EchoOperation: Operation<EchoServerInput, EchoServerOutput, HandlerContext> = async (input, context) => {
  console.log(`Received Echo operation from: ${context.user}`);

  if (input.string != undefined && input.string === reverse(input.string)) {
    throw new PalindromeException({ message: "Cannot handle palindrome" });
  }

  return {
    string: input.string,
  };
};
