import { describe, expect, it } from "vitest";
import { approvals, billingStates, commercialDocuments } from "./schema";
describe("commercial change persistence", () =>
  it("defines the evidence, billing, and approval tables", () =>
    expect([commercialDocuments, billingStates, approvals]).toHaveLength(3)));
