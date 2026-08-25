import type { TrueForgeAdapter } from "./index";

export type BillingTerms = {
  platformFeeCents: number;
  discountBps: number;
  activeServices: { serviceId: string; annualFeeCents: number }[];
};
export type BillingCorrection = {
  accountId: string;
  caseId: string;
  approvalId: string;
  idempotencyKey: string;
  before: BillingTerms;
  after: BillingTerms;
  annualizedImpactCents: number;
};
export type ContractAgentResult = {
  agentId: "contract_agent";
  status: "completed" | "failed" | "ambiguous";
  commercialFacts: unknown[];
  confidence: number;
  conflicts: string[];
  followUpRequired: boolean;
};
export type ContractAgentClient = (
  documents: unknown[],
) => Promise<ContractAgentResult>;

export type GoldenPathInvestigation = {
  caseId: string;
  sessionId: string;
  approvalId: string;
  proposalId: string;
  correction: BillingCorrection;
  status: "waiting_for_approval";
};

export type GoldenPathResolution = {
  caseId: string;
  status: "resolved";
  verification: { passed: boolean; reconciliation: unknown };
};

export type SupervisorDependencies = {
  trueforge: Pick<TrueForgeAdapter, "createOrReuseSession" | "submitTurn">;
  readContract: (accountId: string) => Promise<unknown[]>;
  contractAgent: ContractAgentClient;
  parseContractAgent: (value: unknown) => ContractAgentResult;
  operations: {
    appendCaseEvent: (
      ...args: [string, string, string, unknown]
    ) => Promise<void>;
    createCommercialChangeCase: (
      accountId: string,
      trueforgeSessionId: string,
    ) => Promise<{ caseId: string }>;
    proposeBillingCorrection: (
      caseId: string,
      approvalId: string,
      idempotencyKey: string,
    ) => Promise<{
      proposalId: string;
      before: BillingCorrection["before"];
      after: BillingCorrection["after"];
      annualizedImpactCents: number;
    }>;
    decideApproval: (
      approvalId: string,
      decision: "approved" | "rejected",
      decidedBy: string,
    ) => Promise<unknown>;
    updateApprovedBillingTerms: (input: {
      approvalId: string;
    }) => Promise<unknown>;
    verifyBillingCorrection: (caseId: string) => Promise<{
      passed: boolean;
      reconciliation: unknown;
    }>;
  };
  idFactory?: () => { approvalId: string; idempotencyKey: string };
};

const ids = () => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return { approvalId: `approval-${suffix}`, idempotencyKey: `acme-${suffix}` };
};

/** Starts the governed investigation and deliberately returns before any billing write. */
export async function startAcmeGoldenPath(
  accountId: string,
  dependencies: SupervisorDependencies,
  existingSessionId?: string,
): Promise<GoldenPathInvestigation> {
  const session =
    await dependencies.trueforge.createOrReuseSession(existingSessionId);
  const sessionId = String(
    (session as { id?: string }).id ?? existingSessionId ?? "",
  );
  if (!sessionId) throw new Error("TRUEFORGE_SESSION_ID_MISSING");

  await dependencies.trueforge.submitTurn(sessionId, {
    action: "commercial_change_assurance",
    accountId,
    approvalBoundary: "pause_before_update_billing_terms",
  });
  const documents = await dependencies.readContract(accountId);
  const specialist = dependencies.parseContractAgent(
    await dependencies.contractAgent(documents),
  );
  if (specialist.status !== "completed" || specialist.followUpRequired)
    throw new Error("CONTRACT_AGENT_BLOCKED");

  const created = await dependencies.operations.createCommercialChangeCase(
    accountId,
    sessionId,
  );
  await dependencies.operations.appendCaseEvent(
    created.caseId,
    "specialist.completed",
    "contract_agent",
    {
      status: specialist.status,
      confidence: specialist.confidence,
      evidenceCount: specialist.commercialFacts.length,
    },
  );
  const { approvalId, idempotencyKey } = (dependencies.idFactory ?? ids)();
  const proposal = await dependencies.operations.proposeBillingCorrection(
    created.caseId,
    approvalId,
    idempotencyKey,
  );
  return {
    caseId: created.caseId,
    sessionId,
    approvalId,
    proposalId: proposal.proposalId,
    correction: {
      accountId,
      caseId: created.caseId,
      approvalId,
      idempotencyKey,
      before: proposal.before,
      after: proposal.after,
      annualizedImpactCents: proposal.annualizedImpactCents,
    },
    status: "waiting_for_approval",
  };
}

/** Resumes only after an explicit human approval and verifies authoritative billing. */
export async function resumeAcmeGoldenPath(
  investigation: GoldenPathInvestigation,
  operations: Pick<
    SupervisorDependencies["operations"],
    "decideApproval" | "updateApprovedBillingTerms" | "verifyBillingCorrection"
  >,
  decidedBy = "revenue-ops-demo",
): Promise<GoldenPathResolution> {
  await operations.decideApproval(
    investigation.approvalId,
    "approved",
    decidedBy,
  );
  await operations.updateApprovedBillingTerms({
    approvalId: investigation.approvalId,
  });
  const verification = await operations.verifyBillingCorrection(
    investigation.caseId,
  );
  if (!verification.passed) throw new Error("BILLING_VERIFICATION_FAILED");
  return { caseId: investigation.caseId, status: "resolved", verification };
}
