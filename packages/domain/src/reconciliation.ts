import {
  BillingTermsSchema,
  CommercialStateSchema,
  type CommercialEvidence,
  type CommercialState,
  type BillingTerms,
} from "@workeros/contracts";

type GoverningDocument = {
  id: string;
  effectiveFrom: string;
  kind: "agreement" | "amendment";
  terms: BillingTerms;
  evidence: CommercialEvidence[];
};
export type Reconciliation = {
  expected: CommercialState;
  billing: BillingTerms;
  annualizedLeakageCents: number;
  correctionRequired: boolean;
};

const annualValue = (terms: BillingTerms) =>
  Math.round((terms.platformFeeCents * (10_000 - terms.discountBps)) / 10_000) +
  terms.activeServices.reduce(
    (sum, service) => sum + service.annualFeeCents,
    0,
  );

export function compileCommercialState(
  accountId: string,
  effectiveAt: string,
  documents: GoverningDocument[],
): CommercialState {
  const eligible = documents
    .filter((document) => document.effectiveFrom <= effectiveAt)
    .sort(
      (a, b) =>
        a.effectiveFrom.localeCompare(b.effectiveFrom) ||
        (a.kind === "agreement" ? -1 : 1),
    );
  if (!eligible.length) throw new Error("GOVERNING_EVIDENCE_MISSING");
  const active = eligible.at(-1)!;
  if (active.evidence.length === 0)
    throw new Error("GOVERNING_EVIDENCE_MISSING");
  const duplicateAmendment = eligible.filter(
    (document) =>
      document.kind === "amendment" &&
      document.effectiveFrom === active.effectiveFrom,
  );
  if (duplicateAmendment.length > 1)
    throw new Error("GOVERNING_EVIDENCE_AMBIGUOUS");
  const terms = BillingTermsSchema.parse(active.terms);
  return CommercialStateSchema.parse({
    accountId,
    effectiveAt,
    governingDocuments: eligible.map((document) => document.id),
    ...terms,
    expectedAnnualValueCents: annualValue(terms),
    evidence: active.evidence,
    confidence: 1,
    conflicts: [],
  });
}

export function reconcileCommercialState(
  expected: CommercialState,
  billing: BillingTerms,
): Reconciliation {
  const parsedBilling = BillingTermsSchema.parse(billing);
  const annualizedLeakageCents =
    expected.expectedAnnualValueCents - annualValue(parsedBilling);
  return {
    expected,
    billing: parsedBilling,
    annualizedLeakageCents,
    correctionRequired: annualizedLeakageCents !== 0,
  };
}

export const annualBillingValue = annualValue;
