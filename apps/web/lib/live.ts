import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
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
import { closeMcpClient } from "./mcp-client";
import type { ApproverSession } from "./session";

const env = (name: string, fallback: string) =>
  process.env[name]?.trim() || fallback;

async function withMcpClient<T>(fn: (client: Client) => Promise<T>) {
  const client = new Client({ name: "workeros-web", version: "0.3.0" });
  const transport = new StreamableHTTPClientTransport(
    new URL(env("WORKEROS_MCP_URL", "http://127.0.0.1:4000/mcp")),
  );
  await client.connect(transport);
  try {
    return await fn(client);
  } finally {
    await closeMcpClient(client);
  }
}

async function mcpCall<T>(
  client: Client,
  name: string,
  accountId: string,
): Promise<T> {
  const result = await client.callTool({
    name,
    arguments: { accountId },
  });
  if (result.isError) throw new Error("MCP_TOOL_FAILED");
  if (result.structuredContent) return result.structuredContent as T;
  const content = result.content as Array<{ type: string; text?: string }>;
  const text = content.find((item) => item.type === "text")?.text;
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
      return withMcpClient(async (client) => {
        await Promise.all([
          mcpCall(client, "get_account", id),
          mcpCall(client, "get_crm_state", id),
          mcpCall(client, "get_billing_state", id),
        ]);
        const value = await mcpCall<unknown>(client, "get_contract", id);
        if (Array.isArray(value)) return value;
        if (
          value &&
          typeof value === "object" &&
          Array.isArray((value as { documents?: unknown[] }).documents)
        )
          return (value as { documents: unknown[] }).documents;
        throw new Error("MCP_CONTRACT_RESULT_NOT_A_LIST");
      });
    },
    contractAgent,
    parseContractAgent: (value) => ContractAgentResultSchema.parse(value),
    operations,
  });
}

async function loadInvestigation(
  caseId: string,
  session: ApproverSession,
): Promise<GoldenPathInvestigation> {
  const currentCase = await db().query.cases.findFirst({
    where: eq(cases.id, caseId),
  });
  if (!currentCase) throw new Error("CASE_NOT_FOUND");
  if (currentCase.workspaceId !== session.workspaceId)
    throw new Error("CASE_WORKSPACE_FORBIDDEN");
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

export async function approveLiveAcmeCase(
  caseId: string,
  session: ApproverSession,
) {
  if (!session.roles.includes("revenue_ops"))
    throw new Error("APPROVAL_ROLE_FORBIDDEN");
  const investigation = await loadInvestigation(caseId, session);
  const result = await resumeAcmeGoldenPath(investigation, operations, {
    userId: session.userId,
    workspaceId: session.workspaceId,
  });
  return result;
}
