import { z } from 'zod';
export const CaseStatus = z.enum(['queued','investigating','waiting_for_approval','executing','verifying','resolved','failed']);
export const AgentDefinitionSchema = z.object({id:z.string(),name:z.string(),ownerDepartment:z.string(),purpose:z.string(),version:z.string(),status:z.enum(['draft','active','disabled']),allowedDataScopes:z.array(z.string()),allowedTools:z.array(z.string()),approvalRequiredTools:z.array(z.string())});
export const CaseSchema = z.object({id:z.string(),workspaceId:z.string(),status:CaseStatus,title:z.string(),accountId:z.string(),financialImpactCents:z.number(),createdAt:z.string(),updatedAt:z.string()});
export type CaseStatus = z.infer<typeof CaseStatus>; export type AgentDefinition = z.infer<typeof AgentDefinitionSchema>; export type Case = z.infer<typeof CaseSchema>;
