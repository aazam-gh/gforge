import { ContractAgentResultSchema } from "@workeros/contracts";
import { approvals, cases, db, proposals } from "@workeros/db";
import {
  appendCaseEvent,
  createCommercialChangeCase,
  decideApproval,
  proposeBillingCorrection,
  updateApprovedBillingTerms,
  verifyBillingCorrection,
} from "@workeros/operations";
import {
  resumeAcmeGoldenPath,
  startAcmeGoldenPath,
  type GoldenPathInvestigation,
  TrueForgeAdapter,
} from "@workeros/trueforge";
import { eq } from "drizzle-orm";

const env = (name: string, fallback: string) =>
  process.env[name]?.trim() || fallback;

async function mcpCall<T>(name: string, accountId: string): Promise<T> {
  const response = await fetch(
    env("WORKEROS_MCP_URL", "http://127.0.0.1:4000/mcp"),
    {
      method: "POST",
      headers: {
        accept: "application/json, text/event-stream",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: { name, arguments: { accountId } },
      }),
    },
  );
  const raw = await response.text();
  const dataLine = raw.split("\n").find((line) => line.startsWith("data: "));
  const envelope = JSON.parse(dataLine?.slice(6) ?? raw) as {
    error?: { message?: string };
    result?: { structuredContent?: T; content?: { text?: string }[] };
  };
  if (!response.ok || envelope.error)
    throw new Error(envelope.error?.message ?? "MCP_REQUEST_FAILED");
  if (envelope.result?.structuredContent)
    return envelope.result.structuredContent;
  const text = envelope.result?.content?.find((item) => item.text)?.text;
  if (!text) throw new Error("MCP_EMPTY_RESULT");
  return JSON.parse(text) as T;
}

async function contractAgent(documents: unknown[]) {
  const response = await fetch(
    env("WORKEROS_ADK_URL", "http://127.0.0.1:8001") + "/v1/contract-analysis",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ documents }),
    },
  );
  const value = await response.json();
  if (!response.ok) throw new Error(value.detail ?? "ADK_REQUEST_FAILED");
  return value;
}

const operations = {
  appendCaseEvent,
  createCommercialChangeCase,
  proposeBillingCorrection,
  decideApproval,
  updateApprovedBillingTerms,
  verifyBillingCorrection,
};

export async function startLiveAcmeInvestigation() {
  const accountId = "acme-global";
  const adapter = new TrueForgeAdapter();
  if (adapter.state !== "connected")
    throw new Error(
      "TRUEFORGE_UNAVAILABLE: configure TRUEFORGE_BASE_URL and TRUEFORGE_AGENT_NAME; add TRUEFORGE_TOKEN only when the tenant requires authentication",
    );
  return startAcmeGoldenPath(accountId, {
    trueforge: adapter,
    readContract: async (id) => {
      await Promise.all([
        mcpCall("get_account", id),
        mcpCall("get_crm_state", id),
        mcpCall("get_billing_state", id),
      ]);
      const value = await mcpCall<unknown>("get_contract", id);
      if (Array.isArray(value)) return value;
      if (
        value &&
        typeof value === "object" &&
        Array.isArray((value as { documents?: unknown[] }).documents)
      )
        return (value as { documents: unknown[] }).documents;
      throw new Error("MCP_CONTRACT_RESULT_NOT_A_LIST");
    },
    contractAgent,
    parseContractAgent: (value) => ContractAgentResultSchema.parse(value),
    operations,
  });
}

async function loadInvestigation(
  caseId: string,
): Promise<GoldenPathInvestigation> {
  const currentCase = await db().query.cases.findFirst({
    where: eq(cases.id, caseId),
  });
  if (!currentCase) throw new Error("CASE_NOT_FOUND");
  const approval = await db().query.approvals.findFirst({
    where: eq(approvals.caseId, caseId),
  });
  if (!approval) throw new Error("APPROVAL_NOT_FOUND");
  const proposal = await db().query.proposals.findFirst({
    where: eq(proposals.id, approval.proposalId),
  });
  if (!proposal) throw new Error("PROPOSAL_NOT_FOUND");
  return {
    caseId,
    sessionId: currentCase.trueforgeSessionId ?? "",
    approvalId: approval.id,
    proposalId: proposal.id,
    correction: {
      accountId: currentCase.accountId,
      caseId,
      approvalId: approval.id,
      idempotencyKey: proposal.idempotencyKey,
      before: proposal.before,
      after: proposal.after,
      annualizedImpactCents: Number(proposal.impactCents),
    },
    status: "waiting_for_approval",
  };
}

export async function approveLiveAcmeCase(caseId: string) {
  const investigation = await loadInvestigation(caseId);
  const result = await resumeAcmeGoldenPath(investigation, operations);
  return result;
}
