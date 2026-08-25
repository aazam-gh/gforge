import { describe, expect, it } from "vitest";
import {
  annualBillingValue,
  compileCommercialState,
  reconcileCommercialState,
} from "./reconciliation";

const evidence = (documentId: string, effectiveFrom: string) => [
  {
    documentId,
    clauseId: "pricing",
    effectiveFrom,
    extractedValue: "validated",
    source:
      documentId === "agreement-1"
        ? ("contract" as const)
        : ("amendment" as const),
  },
];
const original = {
  platformFeeCents: 120_000_000,
  discountBps: 1500,
  activeServices: [],
};
const amendment = {
  platformFeeCents: 128_400_000,
  discountBps: 0,
  activeServices: [
    { serviceId: "premium-data-processing", annualFeeCents: 4_800_000 },
  ],
};
describe("commercial reconciliation", () => {
  it("applies Amendment #3 and deterministically calculates the Acme drift", () => {
    const expected = compileCommercialState("acme-global", "2026-07-01", [
      {
        id: "agreement-1",
        effectiveFrom: "2025-01-01",
        kind: "agreement",
        terms: original,
        evidence: evidence("agreement-1", "2025-01-01"),
      },
      {
        id: "amendment-3",
        effectiveFrom: "2026-07-01",
        kind: "amendment",
        terms: amendment,
        evidence: evidence("amendment-3", "2026-07-01"),
      },
    ]);
    const result = reconcileCommercialState(expected, original);
    expect(expected.expectedAnnualValueCents).toBe(133_200_000);
    expect(annualBillingValue(original)).toBe(102_000_000);
    expect(result.annualizedLeakageCents).toBe(31_200_000);
  });
  it("fails closed for conflicting governing amendments", () =>
    expect(() =>
      compileCommercialState("acme-global", "2026-07-01", [
        {
          id: "a",
          effectiveFrom: "2026-07-01",
          kind: "amendment",
          terms: amendment,
          evidence: evidence("a", "2026-07-01"),
        },
        {
          id: "b",
          effectiveFrom: "2026-07-01",
          kind: "amendment",
          terms: amendment,
          evidence: evidence("b", "2026-07-01"),
        },
      ]),
    ).toThrow("GOVERNING_EVIDENCE_AMBIGUOUS"));
});
