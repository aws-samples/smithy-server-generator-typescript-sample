import { Operation } from "@aws-smithy/server-common";
import {
  LengthServerInput,
  LengthServerOutput,
  PalindromeException,
} from "@smithy-demo/string-wizard-service-ssdk";
import { HandlerContext } from "./apigateway";
import { reverse } from "./util";

// This is the implementation of business logic of the LengthOperation
export const LengthOperation: Operation<LengthServerInput, LengthServerOutput, HandlerContext> = async (
  input,
  context
) => {
  console.log(`Received Length operation from: ${context.user}`);

  if (input.string != undefined && input.string === reverse(input.string)) {
    throw new PalindromeException({ message: "Cannot handle palindrome" });
  }

  return {
    length: input.string?.length,
  };
};
