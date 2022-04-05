import { EchoOperation } from "./echo";
import { PalindromeException } from "@smithy-demo/string-wizard-service-ssdk";

describe("Echo tests", () => {
  const context = { user: "user123" };

  it("echoes the string back", async () => {
    const output = await EchoOperation({ string: "canoe" }, context);
    expect(output.string).toBe("canoe");
  });

  it("handles undefined", async () => {
    const output = await EchoOperation({}, context);
    expect(output.string).toBeUndefined();
  });

  it("throws on palindrome", async () => {
    expect.assertions(1);
    try {
      await EchoOperation({ string: "kayak" }, context);
    } catch (e) {
      expect(e).toBeInstanceOf(PalindromeException);
    }
  });
});
