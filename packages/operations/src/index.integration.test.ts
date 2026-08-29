import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import {
  approvals,
  billingStates,
  caseEvents,
  cases,
  closeDb,
  db,
  proposals,
  verificationOutcomes,
} from "@workeros/db";
import {
  createCommercialChangeCase,
  decideApproval,
  proposeBillingCorrection,
  readBillingState,
  updateApprovedBillingTerms,
  updateBillingTerms,
  verifyBillingCorrection,
} from "./index";

const originalTerms = {
  platformFeeCents: 120_000_000,
  discountBps: 1500,
  activeServices: [],
};

const integration = process.env.DATABASE_URL ? describe : describe.skip;

vi.setConfig({ hookTimeout: 30_000, testTimeout: 30_000 });

async function resetWorkflow() {
  await db().delete(verificationOutcomes);
  await db().delete(approvals);
  await db().delete(proposals);
  await db().delete(caseEvents);
  await db().delete(cases);
  await db()
    .update(billingStates)
    .set({ terms: originalTerms, version: "1", updatedAt: new Date() })
    .where(eq(billingStates.accountId, "acme-global"));
}

async function pendingCorrection() {
  const { caseId } = await createCommercialChangeCase(
    "acme-global",
    "tf-integration-session",
  );
  const approvalId = randomUUID();
  const proposal = await proposeBillingCorrection(
    caseId,
    approvalId,
    `integration-${randomUUID()}`,
  );
  return {
    caseId,
    approvalId,
    correction: {
      accountId: "acme-global",
      caseId,
      approvalId,
      idempotencyKey: (await db().query.proposals.findFirst({
        where: eq(proposals.id, proposal.proposalId),
      }))!.idempotencyKey,
      before: proposal.before,
      after: proposal.after,
      annualizedImpactCents: proposal.annualizedImpactCents,
    },
  };
}

integration("persisted approval and billing safety", () => {
  beforeEach(resetWorkflow);
  afterAll(closeDb);

  it("leaves billing unchanged without an approved decision", async () => {
    const { approvalId } = await pendingCorrection();

    await expect(updateApprovedBillingTerms({ approvalId })).rejects.toThrow();
    expect((await readBillingState("acme-global")).terms).toEqual(
      originalTerms,
    );
  });

  it("leaves billing unchanged after rejection", async () => {
    const { approvalId } = await pendingCorrection();
    await decideApproval(approvalId, "rejected", "revenue-ops-reviewer");

    await expect(updateApprovedBillingTerms({ approvalId })).rejects.toThrow();
    expect((await readBillingState("acme-global")).terms).toEqual(
      originalTerms,
    );
  });

  it("cannot decide or consume an expired approval", async () => {
    const { approvalId } = await pendingCorrection();
    await db()
      .update(approvals)
      .set({ expiresAt: new Date(Date.now() - 60_000) })
      .where(eq(approvals.id, approvalId));

    await expect(
      decideApproval(approvalId, "approved", "revenue-ops-reviewer"),
    ).rejects.toThrow("APPROVAL_EXPIRED");
    await expect(updateApprovedBillingTerms({ approvalId })).rejects.toThrow();
    expect((await readBillingState("acme-global")).terms).toEqual(
      originalTerms,
    );
  });

  it("rejects malformed and proposal-tampered corrections", async () => {
    const { approvalId, correction } = await pendingCorrection();
    await decideApproval(approvalId, "approved", "revenue-ops-reviewer");

    await expect(
      updateBillingTerms({
        ...correction,
        after: { ...correction.after, platformFeeCents: 1 },
      }),
    ).rejects.toThrow("PROPOSAL_TERMS_MISMATCH");
    await expect(
      updateBillingTerms({ ...correction, approvalId: "not-a-uuid" }),
    ).rejects.toThrow();
    expect((await readBillingState("acme-global")).terms).toEqual(
      originalTerms,
    );
  });

  it("consumes an approved proposal exactly once and reuses persisted results", async () => {
    const { caseId, approvalId } = await pendingCorrection();
    await decideApproval(approvalId, "approved", "revenue-ops-reviewer");
    await decideApproval(approvalId, "approved", "revenue-ops-reviewer");

    const first = await updateApprovedBillingTerms({ approvalId });
    const second = await updateApprovedBillingTerms({ approvalId });
    expect(second).toEqual(first);

    const billing = await readBillingState("acme-global");
    expect(billing.version).toBe("2");
    expect(billing.terms).toEqual(first.billing);

    const approval = await db().query.approvals.findFirst({
      where: eq(approvals.id, approvalId),
    });
    expect(approval?.consumedAt).toBeInstanceOf(Date);

    const granted = await db().query.caseEvents.findMany({
      where: eq(caseEvents.type, "approval.granted"),
    });
    const mutations = await db().query.caseEvents.findMany({
      where: eq(caseEvents.type, "billing.mutation.completed"),
    });
    expect(granted).toHaveLength(1);
    expect(mutations).toHaveLength(1);

    const orderedEvents = await db().query.caseEvents.findMany({
      where: eq(caseEvents.caseId, caseId),
      orderBy: (events, { asc }) => [asc(events.sequence)],
    });
    expect(orderedEvents.map((event) => event.sequence)).toEqual(
      orderedEvents.map((_, index) => String(index + 1).padStart(4, "0")),
    );

    const verification = await verifyBillingCorrection(caseId);
    expect(verification.passed).toBe(true);
    const resolved = await db().query.cases.findFirst({
      where: eq(cases.id, caseId),
    });
    expect(resolved?.status).toBe("resolved");
  });

  it("keeps the Case unresolved when authoritative verification fails", async () => {
    const { caseId } = await pendingCorrection();

    const verification = await verifyBillingCorrection(caseId);
    expect(verification.passed).toBe(false);
    const failed = await db().query.cases.findFirst({
      where: eq(cases.id, caseId),
    });
    expect(failed?.status).toBe("failed");
  });
});
