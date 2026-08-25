import { z } from "zod";

export const CaseStatus = z.enum([
  "queued",
  "investigating",
  "waiting_for_approval",
  "executing",
  "verifying",
  "resolved",
  "failed",
]);
export const AgentDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerDepartment: z.string(),
  purpose: z.string(),
  version: z.string(),
  status: z.enum(["draft", "active", "disabled"]),
  allowedDataScopes: z.array(z.string()),
  allowedTools: z.array(z.string()),
  approvalRequiredTools: z.array(z.string()),
});
export const CaseSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  status: CaseStatus,
  title: z.string(),
  accountId: z.string(),
  financialImpactCents: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CommercialEvidenceSchema = z.object({
  documentId: z.string(),
  clauseId: z.string(),
  effectiveFrom: z.string().date(),
  extractedValue: z.union([z.string(), z.number(), z.boolean()]),
  source: z.enum(["contract", "amendment", "crm", "billing"]),
});
export const CommercialTermSchema = z.object({
  platformFeeCents: z.number().int().nonnegative(),
  discountBps: z.number().int().min(0).max(10_000),
  activeServices: z.array(
    z.object({
      serviceId: z.string(),
      annualFeeCents: z.number().int().nonnegative(),
    }),
  ),
  evidence: z.array(CommercialEvidenceSchema).min(1),
});
export const CommercialStateSchema = z.object({
  accountId: z.string(),
  effectiveAt: z.string().date(),
  governingDocuments: z.array(z.string()).min(1),
  platformFeeCents: z.number().int().nonnegative(),
  discountBps: z.number().int().min(0).max(10_000),
  activeServices: z.array(
    z.object({
      serviceId: z.string(),
      annualFeeCents: z.number().int().nonnegative(),
    }),
  ),
  expectedAnnualValueCents: z.number().int().nonnegative(),
  evidence: z.array(CommercialEvidenceSchema).min(1),
  confidence: z.number().min(0).max(1),
  conflicts: z.array(z.string()),
});
export const ContractAgentResultSchema = z.object({
  agentId: z.literal("contract_agent"),
  status: z.enum(["completed", "failed", "ambiguous"]),
  commercialFacts: z.array(CommercialEvidenceSchema),
  confidence: z.number().min(0).max(1),
  conflicts: z.array(z.string()),
  followUpRequired: z.boolean(),
  error: z.string().optional(),
});
export const BillingTermsSchema = z.object({
  platformFeeCents: z.number().int().nonnegative(),
  discountBps: z.number().int().min(0).max(10_000),
  activeServices: z.array(
    z.object({
      serviceId: z.string(),
      annualFeeCents: z.number().int().nonnegative(),
    }),
  ),
});
export const BillingCorrectionSchema = z.object({
  accountId: z.string(),
  caseId: z.string(),
  approvalId: z.string(),
  idempotencyKey: z.string().min(8),
  before: BillingTermsSchema,
  after: BillingTermsSchema,
  annualizedImpactCents: z.number().int().positive(),
});
export const ApprovedBillingCorrectionRequestSchema = z
  .object({ approvalId: z.string().min(1) })
  .strict();
export const ApprovalDecisionSchema = z.enum(["approved", "rejected"]);

export type CaseStatus = z.infer<typeof CaseStatus>;
export type AgentDefinition = z.infer<typeof AgentDefinitionSchema>;
export type Case = z.infer<typeof CaseSchema>;
export type CommercialEvidence = z.infer<typeof CommercialEvidenceSchema>;
export type CommercialState = z.infer<typeof CommercialStateSchema>;
export type ContractAgentResult = z.infer<typeof ContractAgentResultSchema>;
export type BillingTerms = z.infer<typeof BillingTermsSchema>;
export type BillingCorrection = z.infer<typeof BillingCorrectionSchema>;
export type ApprovedBillingCorrectionRequest = z.infer<
  typeof ApprovedBillingCorrectionRequestSchema
>;
