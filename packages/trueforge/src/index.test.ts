import { describe, expect, it } from "vitest";
import { TrueForgeAdapter } from "./index";
describe("TrueForge adapter", () => {
  it("is explicit when unavailable", () =>
    expect(new TrueForgeAdapter({}).state).toBe("unavailable"));
  it("never creates a fake session without configuration", async () =>
    await expect(
      new TrueForgeAdapter({}).createOrReuseSession(),
    ).rejects.toThrow("TRUEFORGE_UNAVAILABLE"));
});
