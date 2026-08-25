import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { BillingCorrectionSchema } from "@workeros/contracts";
import {
  readAccount,
  readBillingState,
  readContract,
  readCrmState,
  updateBillingTerms,
} from "@workeros/operations";
import { z } from "zod";

const result = (value: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(value) }],
  ...(value && typeof value === "object" && !Array.isArray(value)
    ? { structuredContent: value as Record<string, unknown> }
    : {}),
});
const readInput = { accountId: z.string().min(1) };
export function createEnterpriseMcpServer() {
  const server = new McpServer({
    name: "workeros-enterprise",
    version: "0.2.0",
  });
  server.tool(
    "get_account",
    "Read authoritative account identity. Read-only.",
    readInput,
    async ({ accountId }) => result(await readAccount(accountId)),
  );
  server.tool(
    "get_contract",
    "Read governing agreements and amendments with evidence. Read-only.",
    readInput,
    async ({ accountId }) => result(await readContract(accountId)),
  );
  server.tool(
    "get_crm_state",
    "Read CRM commercial state. Read-only.",
    readInput,
    async ({ accountId }) => result(await readCrmState(accountId)),
  );
  server.tool(
    "get_billing_state",
    "Read authoritative current billing terms. Read-only.",
    readInput,
    async ({ accountId }) => result(await readBillingState(accountId)),
  );
  server.tool(
    "update_billing_terms",
    "Sensitive write. Applies exact approved commercial terms only after a valid persisted TrueForge-linked approval.",
    { correction: BillingCorrectionSchema },
    async ({ correction }) => result(await updateBillingTerms(correction)),
  );
  return server;
}
export const server = createEnterpriseMcpServer();
