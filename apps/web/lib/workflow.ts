import {
  approvals,
  caseEvents,
  cases,
  db,
  proposals,
  verificationOutcomes,
} from "@workeros/db";
import { desc, eq } from "drizzle-orm";

export async function acmeWorkflow(caseId?: string) {
  const currentCase = caseId
    ? await db().query.cases.findFirst({ where: eq(cases.id, caseId) })
    : (
        await db()
          .select()
          .from(cases)
          .where(eq(cases.accountId, "acme-global"))
          .orderBy(desc(cases.createdAt))
          .limit(1)
      )[0];
  if (!currentCase) return null;
  const approval = await db().query.approvals.findFirst({
    where: eq(approvals.caseId, currentCase.id),
  });
  const [verification, events] = await Promise.all([
    db().query.verificationOutcomes.findFirst({
      where: eq(verificationOutcomes.caseId, currentCase.id),
    }),
    db()
      .select()
      .from(caseEvents)
      .where(eq(caseEvents.caseId, currentCase.id))
      .orderBy(caseEvents.sequence),
  ]);
  const proposal = approval
    ? await db().query.proposals.findFirst({
        where: eq(proposals.id, approval.proposalId),
      })
    : undefined;
  return { currentCase, approval, proposal, verification, events };
}
