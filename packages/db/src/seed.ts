import { eq } from "drizzle-orm";
import { db, closeDb } from "./client";
import {
  accounts,
  billingStates,
  commercialDocuments,
  crmStates,
  workspaces,
} from "./schema";

const original = {
  platformFeeCents: 120_000_000,
  discountBps: 1500,
  activeServices: [],
};
const amended = {
  platformFeeCents: 128_400_000,
  discountBps: 0,
  activeServices: [
    { serviceId: "premium-data-processing", annualFeeCents: 4_800_000 },
  ],
};
const evidence = (
  documentId: string,
  effectiveFrom: string,
  source: "contract" | "amendment",
) => [
  {
    documentId,
    clauseId: "commercial-terms",
    effectiveFrom,
    extractedValue:
      documentId === "amendment-3"
        ? "platform=1284000;discount=0;premium=48000"
        : "platform=1200000;discount=15",
    source,
  },
];
async function main() {
  const database = db();
  await database
    .insert(workspaces)
    .values({ id: "acme-operations", name: "Acme Operations" })
    .onConflictDoNothing();
  await database
    .insert(accounts)
    .values({
      id: "acme-global",
      workspaceId: "acme-operations",
      name: "Acme Global",
    })
    .onConflictDoNothing();
  await database
    .insert(commercialDocuments)
    .values([
      {
        id: "agreement-1",
        accountId: "acme-global",
        kind: "agreement",
        effectiveFrom: "2025-01-01",
        terms: original,
        evidence: evidence("agreement-1", "2025-01-01", "contract"),
      },
      {
        id: "amendment-3",
        accountId: "acme-global",
        kind: "amendment",
        effectiveFrom: "2026-07-01",
        terms: amended,
        evidence: evidence("amendment-3", "2026-07-01", "amendment"),
      },
    ])
    .onConflictDoNothing();
  await database
    .insert(crmStates)
    .values({ accountId: "acme-global", terms: amended })
    .onConflictDoUpdate({
      target: crmStates.accountId,
      set: { terms: amended, updatedAt: new Date() },
    });
  await database
    .insert(billingStates)
    .values({ accountId: "acme-global", terms: original, version: "1" })
    .onConflictDoUpdate({
      target: billingStates.accountId,
      set: { terms: original, version: "1", updatedAt: new Date() },
    });
  await closeDb();
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
