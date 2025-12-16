import { sum } from "../lib/utils";

describe("sum utility", () => {
  it("adds two numbers", () => {
    expect(sum(2, 3)).toBe(5);
  });
});
