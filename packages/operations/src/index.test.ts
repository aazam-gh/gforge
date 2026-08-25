import { describe, expect, it } from "vitest";
import { compileAcmeReconciliation } from "./index";
describe("operations boundary", () =>
  it("exports the persisted reconciliation operation", () =>
    expect(typeof compileAcmeReconciliation).toBe("function")));
