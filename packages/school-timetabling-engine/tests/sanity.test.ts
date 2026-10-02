import { describe, it, expect } from "vitest";
import { VERSION } from "../src/index";

describe("Toolchain Sanity", () => {
  it("executes tests with Vitest", () => {
    expect(VERSION).toBe("1.0.0");
  });
});
