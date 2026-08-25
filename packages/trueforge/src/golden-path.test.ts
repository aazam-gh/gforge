import { describe, expect, it, vi } from "vitest";
import { startAcmeGoldenPath } from "./golden-path";

describe("Acme golden path", () => {
  it("stops at a persisted approval boundary before billing mutation", async () => {
    const submitTurn = vi.fn().mockResolvedValue(undefined);
    const result = await startAcmeGoldenPath("acme-global", {
      trueforge: {
        createOrReuseSession: vi.fn().mockResolvedValue({ id: "tf-session-1" }),
        submitTurn,
      },
      readContract: vi.fn().mockResolvedValue([]),
      contractAgent: vi.fn().mockResolvedValue({
        agentId: "contract_agent",
        status: "completed",
        commercialFacts: [],
        confidence: 1,
        conflicts: [],
        followUpRequired: false,
      }),
      parseContractAgent: (value) => value as never,
      operations: {
        appendCaseEvent: vi.fn().mockResolvedValue(undefined),
        createCommercialChangeCase: vi
          .fn()
          .mockResolvedValue({ caseId: "CASE-1" }),
        proposeBillingCorrection: vi.fn().mockResolvedValue({
          proposalId: "proposal-1",
          before: {
            platformFeeCents: 102000000,
            discountBps: 1500,
            activeServices: [],
          },
          after: {
            platformFeeCents: 128400000,
            discountBps: 0,
            activeServices: [],
          },
          annualizedImpactCents: 31200000,
        }),
        decideApproval: vi.fn(),
        updateBillingTerms: vi.fn(),
        verifyBillingCorrection: vi.fn(),
      },
      idFactory: () => ({
        approvalId: "approval-1",
        idempotencyKey: "idempotency-1",
      }),
    });
    expect(submitTurn).toHaveBeenCalledWith(
      "tf-session-1",
      expect.objectContaining({ approvalBoundary: expect.any(String) }),
    );
    expect(result.status).toBe("waiting_for_approval");
    expect(result.correction.annualizedImpactCents).toBe(31200000);
  });
});
