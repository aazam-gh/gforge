import {
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { BillingTerms, CommercialEvidence } from "@workeros/contracts";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};
export const workspaces = pgTable("workspaces", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  ...timestamps,
});
export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id),
  name: text("name").notNull(),
  ...timestamps,
});
export const commercialDocuments = pgTable("commercial_documents", {
  id: text("id").primaryKey(),
  accountId: text("account_id")
    .notNull()
    .references(() => accounts.id),
  kind: text("kind", { enum: ["agreement", "amendment"] }).notNull(),
  effectiveFrom: text("effective_from").notNull(),
  terms: jsonb("terms").$type<BillingTerms>().notNull(),
  evidence: jsonb("evidence").$type<CommercialEvidence[]>().notNull(),
  ...timestamps,
});
export const crmStates = pgTable("crm_states", {
  accountId: text("account_id")
    .primaryKey()
    .references(() => accounts.id),
  terms: jsonb("terms").$type<BillingTerms>().notNull(),
  ...timestamps,
});
export const billingStates = pgTable("billing_states", {
  accountId: text("account_id")
    .primaryKey()
    .references(() => accounts.id),
  terms: jsonb("terms").$type<BillingTerms>().notNull(),
  version: text("version").notNull().default("1"),
  ...timestamps,
});
export const cases = pgTable("cases", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id")
    .notNull()
    .references(() => workspaces.id),
  accountId: text("account_id")
    .notNull()
    .references(() => accounts.id),
  title: text("title").notNull(),
  status: text("status").notNull(),
  financialImpactCents: text("financial_impact_cents").notNull(),
  trueforgeSessionId: text("trueforge_session_id"),
  ...timestamps,
});
export const caseEvents = pgTable(
  "case_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    caseId: text("case_id")
      .notNull()
      .references(() => cases.id),
    sequence: text("sequence").notNull(),
    type: text("type").notNull(),
    actor: text("actor").notNull(),
    payload: jsonb("payload").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("case_events_case_sequence").on(table.caseId, table.sequence),
  ],
);
export const proposals = pgTable(
  "proposals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    caseId: text("case_id")
      .notNull()
      .references(() => cases.id),
    before: jsonb("before").$type<BillingTerms>().notNull(),
    after: jsonb("after").$type<BillingTerms>().notNull(),
    impactCents: text("impact_cents").notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("proposals_idempotency").on(table.idempotencyKey)],
);
export const approvals = pgTable(
  "approvals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    proposalId: uuid("proposal_id")
      .notNull()
      .references(() => proposals.id),
    caseId: text("case_id")
      .notNull()
      .references(() => cases.id),
    trueforgeApprovalId: text("trueforge_approval_id").notNull(),
    decision: text("decision", { enum: ["approved", "rejected", "pending"] })
      .notNull()
      .default("pending"),
    decidedBy: text("decided_by"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("approvals_trueforge_id").on(table.trueforgeApprovalId),
  ],
);
export const verificationOutcomes = pgTable("verification_outcomes", {
  id: uuid("id").defaultRandom().primaryKey(),
  caseId: text("case_id")
    .notNull()
    .references(() => cases.id),
  passed: text("passed").notNull(),
  observed: jsonb("observed").$type<BillingTerms>().notNull(),
  expected: jsonb("expected").$type<BillingTerms>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
