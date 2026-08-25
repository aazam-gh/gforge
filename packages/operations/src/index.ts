import { and, eq, sql } from "drizzle-orm";
import {
  ApprovedBillingCorrectionRequestSchema,
  BillingCorrectionSchema,
  BillingTermsSchema,
  type BillingCorrection,
  type BillingTerms,
} from "@workeros/contracts";
import {
  accounts,
  approvals,
  billingStates,
  caseEvents,
  cases,
  commercialDocuments,
  crmStates,
  db,
  proposals,
  verificationOutcomes,
} from "@workeros/db";
import {
  compileCommercialState,
  reconcileCommercialState,
} from "@workeros/domain";
import { assertApprovedWrite } from "@workeros/policy";

export async function readAccount(accountId: string) {
  const value = await db().query.accounts.findFirst({
    where: eq(accounts.id, accountId),
  });
  if (!value) throw new Error("ACCOUNT_NOT_FOUND");
  return value;
}
export async function readContract(accountId: string) {
  return db().query.commercialDocuments.findMany({
    where: eq(commercialDocuments.accountId, accountId),
    orderBy: (documents, { asc }) => [asc(documents.effectiveFrom)],
  });
}
export async function readCrmState(accountId: string) {
  const value = await db().query.crmStates.findFirst({
    where: eq(crmStates.accountId, accountId),
  });
  if (!value) throw new Error("CRM_STATE_NOT_FOUND");
  return value;
}
export async function readBillingState(accountId: string) {
  const value = await db().query.billingStates.findFirst({
    where: eq(billingStates.accountId, accountId),
  });
  if (!value) throw new Error("BILLING_STATE_NOT_FOUND");
  return value;
}

export async function compileAcmeReconciliation(
  accountId: string,
  effectiveAt = "2026-07-01",
) {
  const [documents, crm, billing] = await Promise.all([
    readContract(accountId),
    readCrmState(accountId),
    readBillingState(accountId),
  ]);
  const expected = compileCommercialState(accountId, effectiveAt, documents);
  const reconciliation = reconcileCommercialState(
    expected,
    BillingTermsSchema.parse(billing.terms),
  );
  return { ...reconciliation, crm: BillingTermsSchema.parse(crm.terms) };
}

export async function appendCaseEvent(
  caseId: string,
  type: string,
  actor: string,
  payload: unknown,
) {
  await db().transaction(async (tx) => {
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtextextended(${caseId}, 0))`,
    );
    const [next] = await tx
      .select({
        sequence: sql<number>`coalesce(max(cast(${caseEvents.sequence} as integer)), 0) + 1`,
      })
      .from(caseEvents)
      .where(eq(caseEvents.caseId, caseId));
    await tx.insert(caseEvents).values({
      caseId,
      sequence: String(next.sequence).padStart(4, "0"),
      type,
      actor,
      payload,
    });
  });
}

export async function createCommercialChangeCase(
  accountId: string,
  trueforgeSessionId?: string,
) {
  const account = await readAccount(accountId);
  const reconciliation = await compileAcmeReconciliation(accountId);
  if (!reconciliation.correctionRequired)
    throw new Error("NO_COMMERCIAL_DRIFT");
  const caseId = `CASE-${Date.now()}`;
  await db()
    .insert(cases)
    .values({
      id: caseId,
      workspaceId: account.workspaceId,
      accountId,
      title: "Commercial change assurance: Amendment #3 billing drift",
      status: "investigating",
      financialImpactCents: String(reconciliation.annualizedLeakageCents),
      trueforgeSessionId,
    });
  for (const [type, payload] of [
    ["case.created", { accountId }],
    ["commercial.state.compiled", reconciliation.expected],
    [
      "commercial.drift.detected",
      { annualizedLeakageCents: reconciliation.annualizedLeakageCents },
    ],
  ] as const)
    await appendCaseEvent(
      caseId,
      type,
      "revenue_integrity_supervisor",
      payload,
    );
  return { caseId, reconciliation };
}

export async function proposeBillingCorrection(
  caseId: string,
  approvalId: string,
  idempotencyKey: string,
) {
  const currentCase = await db().query.cases.findFirst({
    where: eq(cases.id, caseId),
  });
  if (!currentCase) throw new Error("CASE_NOT_FOUND");
  const result = await compileAcmeReconciliation(currentCase.accountId);
  const [proposal] = await db()
    .insert(proposals)
    .values({
      caseId,
      before: result.billing,
      after: {
        platformFeeCents: result.expected.platformFeeCents,
        discountBps: result.expected.discountBps,
        activeServices: result.expected.activeServices,
      },
      impactCents: String(result.annualizedLeakageCents),
      idempotencyKey,
    })
    .onConflictDoNothing()
    .returning();
  const activeProposal =
    proposal ??
    (await db().query.proposals.findFirst({
      where: eq(proposals.idempotencyKey, idempotencyKey),
    }));
  if (!activeProposal) throw new Error("PROPOSAL_CREATE_FAILED");
  await db()
    .insert(approvals)
    .values({
      id: approvalId,
      proposalId: activeProposal.id,
      caseId,
      trueforgeApprovalId: `tf-${approvalId}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    })
    .onConflictDoNothing();
  await db()
    .update(cases)
    .set({ status: "waiting_for_approval", updatedAt: new Date() })
    .where(eq(cases.id, caseId));
  await appendCaseEvent(caseId, "approval.required", "trueforge", {
    approvalId,
    proposalId: activeProposal.id,
    before: activeProposal.before,
    after: activeProposal.after,
  });
  return {
    approvalId,
    proposalId: activeProposal.id,
    before: activeProposal.before,
    after: activeProposal.after,
    annualizedImpactCents: Number(activeProposal.impactCents),
  };
}

export async function decideApproval(
  approvalId: string,
  decision: "approved" | "rejected",
  decidedBy = "revenue-ops-demo",
) {
  const [approval] = await db()
    .update(approvals)
    .set({ decision, decidedBy, updatedAt: new Date() })
    .where(and(eq(approvals.id, approvalId), eq(approvals.decision, "pending")))
    .returning();
  if (!approval) throw new Error("APPROVAL_ALREADY_DECIDED_OR_NOT_FOUND");
  await appendCaseEvent(
    approval.caseId,
    decision === "approved" ? "approval.granted" : "approval.rejected",
    decidedBy,
    { approvalId },
  );
  if (decision === "rejected")
    await db()
      .update(cases)
      .set({ status: "failed", updatedAt: new Date() })
      .where(eq(cases.id, approval.caseId));
  return approval;
}

export async function updateBillingTerms(input: BillingCorrection) {
  const correction = BillingCorrectionSchema.parse(input);
  return db()
    .transaction(async (tx) => {
      const approval = await tx.query.approvals.findFirst({
        where: eq(approvals.id, correction.approvalId),
      });
      assertApprovedWrite("update_billing_terms", approval);
      if (!approval || approval.caseId !== correction.caseId)
        throw new Error("APPROVAL_CASE_MISMATCH");
      const currentCase = await tx.query.cases.findFirst({
        where: eq(cases.id, correction.caseId),
      });
      if (!currentCase) throw new Error("CASE_NOT_FOUND");
      if (currentCase.accountId !== correction.accountId)
        throw new Error("CASE_ACCOUNT_MISMATCH");
      const proposal = await tx.query.proposals.findFirst({
        where: eq(proposals.id, approval.proposalId),
      });
      if (
        !proposal ||
        proposal.caseId !== correction.caseId ||
        proposal.idempotencyKey !== correction.idempotencyKey
      )
        throw new Error("PROPOSAL_MISMATCH");
      const approvedBefore = BillingTermsSchema.parse(proposal.before);
      const approvedAfter = BillingTermsSchema.parse(proposal.after);
      if (
        JSON.stringify(approvedBefore) !== JSON.stringify(correction.before) ||
        JSON.stringify(approvedAfter) !== JSON.stringify(correction.after) ||
        Number(proposal.impactCents) !== correction.annualizedImpactCents
      )
        throw new Error("PROPOSAL_TERMS_MISMATCH");
      const current = await tx.query.billingStates.findFirst({
        where: eq(billingStates.accountId, correction.accountId),
      });
      if (!current) throw new Error("BILLING_STATE_NOT_FOUND");
      if (JSON.stringify(current.terms) !== JSON.stringify(correction.before))
        throw new Error("BILLING_STATE_CHANGED_SINCE_PROPOSAL");
      await tx
        .update(billingStates)
        .set({
          terms: correction.after,
          version: String(Number(current.version) + 1),
          updatedAt: new Date(),
        })
        .where(eq(billingStates.accountId, correction.accountId));
      await tx
        .update(approvals)
        .set({ consumedAt: new Date(), updatedAt: new Date() })
        .where(eq(approvals.id, correction.approvalId));
      await tx
        .update(cases)
        .set({ status: "verifying", updatedAt: new Date() })
        .where(eq(cases.id, correction.caseId));
      return { caseId: correction.caseId, billing: correction.after };
    })
    .then(async (result) => {
      await appendCaseEvent(
        result.caseId,
        "billing.mutation.completed",
        "enterprise_mcp",
        { after: result.billing },
      );
      return result;
    });
}

export async function updateApprovedBillingTerms(input: {
  approvalId: string;
}) {
  const request = ApprovedBillingCorrectionRequestSchema.parse(input);
  const approval = await db().query.approvals.findFirst({
    where: eq(approvals.id, request.approvalId),
  });
  if (!approval) throw new Error("APPROVAL_NOT_FOUND");
  const currentCase = await db().query.cases.findFirst({
    where: eq(cases.id, approval.caseId),
  });
  if (!currentCase) throw new Error("CASE_NOT_FOUND");
  const proposal = await db().query.proposals.findFirst({
    where: eq(proposals.id, approval.proposalId),
  });
  if (!proposal || proposal.caseId !== currentCase.id)
    throw new Error("PROPOSAL_NOT_FOUND");
  return updateBillingTerms({
    accountId: currentCase.accountId,
    caseId: currentCase.id,
    approvalId: approval.id,
    idempotencyKey: proposal.idempotencyKey,
    before: BillingTermsSchema.parse(proposal.before),
    after: BillingTermsSchema.parse(proposal.after),
    annualizedImpactCents: Number(proposal.impactCents),
  });
}

export async function verifyBillingCorrection(caseId: string) {
  const currentCase = await db().query.cases.findFirst({
    where: eq(cases.id, caseId),
  });
  if (!currentCase) throw new Error("CASE_NOT_FOUND");
  const reconciliation = await compileAcmeReconciliation(currentCase.accountId);
  const passed = !reconciliation.correctionRequired;
  await db()
    .insert(verificationOutcomes)
    .values({
      caseId,
      passed: String(passed),
      observed: reconciliation.billing,
      expected: {
        platformFeeCents: reconciliation.expected.platformFeeCents,
        discountBps: reconciliation.expected.discountBps,
        activeServices: reconciliation.expected.activeServices,
      },
    });
  await db()
    .update(cases)
    .set({ status: passed ? "resolved" : "failed", updatedAt: new Date() })
    .where(eq(cases.id, caseId));
  await appendCaseEvent(
    caseId,
    passed ? "verification.passed" : "verification.failed",
    "revenue_integrity_supervisor",
    { annualizedLeakageCents: reconciliation.annualizedLeakageCents },
  );
  return { passed, reconciliation };
}
