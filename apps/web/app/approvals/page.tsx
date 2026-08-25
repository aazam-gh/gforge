import Link from "next/link";
import { ArrowRight, Lock, ShieldCheck } from "lucide-react";
import { acmeSnapshot, dollars } from "../../lib/acme";
import { approveAcmeAction } from "../actions";
import { acmeWorkflow } from "../../lib/workflow";
export const dynamic = "force-dynamic";
export default async function Approvals() {
  const snapshot = await acmeSnapshot();
  const workflow = await acmeWorkflow();
  if (!snapshot)
    return (
      <div className="page">
        <h1>Approvals</h1>
        <p className="subtitle">
          No persisted approval is available until the Acme database is migrated
          and seeded.
        </p>
      </div>
    );
  return (
    <div className="page">
      <div className="page-title">
        <div>
          <div className="eyebrow" style={{ marginBottom: 15 }}>
            governance / human decision
          </div>
          <h1>Approve commercial correction</h1>
          <p className="subtitle">
            The exact commercial terms, financial effect, and governing evidence
            are persisted before this sensitive write can run.
          </p>
        </div>
      </div>
      <section className="card action">
        <div className="section-head">
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Lock size={17} color="var(--signal)" />
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>
                {workflow?.approval?.decision === "approved"
                  ? "approved · resume update_billing_terms"
                  : "pending decision · update_billing_terms"}
              </div>
              <h2>Bring Acme Global billing into agreement</h2>
            </div>
          </div>
          <span
            className={`status ${workflow?.currentCase.status === "waiting_for_approval" ? "warn" : ""}`}
          >
            {workflow?.currentCase.status ?? "not started"}
          </span>
        </div>
        <div
          className="grid"
          style={{ gridTemplateColumns: "repeat(3,1fr)", marginBottom: 22 }}
        >
          <div>
            <div className="eyebrow">annualized impact</div>
            <div className="stat-value warn">
              {dollars(snapshot.annualizedLeakageCents)}
            </div>
          </div>
          <div>
            <div className="eyebrow">before</div>
            <div style={{ fontSize: 13, marginTop: 8 }}>
              {dollars(snapshot.billing.platformFeeCents)} · 15% discount
            </div>
          </div>
          <div>
            <div className="eyebrow">after</div>
            <div style={{ fontSize: 13, marginTop: 8 }}>
              {dollars(snapshot.expected.platformFeeCents)} · 0% · Premium
              enabled
            </div>
          </div>
        </div>
        <p
          style={{
            fontSize: 13,
            color: "#c9b8a9",
            lineHeight: 1.6,
            maxWidth: 680,
            marginBottom: 22,
          }}
        >
          Only a persisted approval tied to the TrueForge request can execute
          this mutation. Rejection changes no billing state.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <Link
            href={`/cases/${workflow?.currentCase.id ?? "acme"}`}
            className="button"
          >
            Inspect evidence <ArrowRight size={14} />
          </Link>
          {workflow &&
          workflow.currentCase.status !== "resolved" &&
          workflow?.approval?.decision !== "rejected" ? (
            <form action={approveAcmeAction}>
              <input
                type="hidden"
                name="caseId"
                value={workflow.currentCase.id}
              />
              <button className="button primary" type="submit">
                Approve and run correction
              </button>
            </form>
          ) : null}
        </div>
      </section>
      <section className="card" style={{ marginTop: 14 }}>
        <div className="section-head">
          <div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>
              safety boundary
            </div>
            <h2>What is enforced</h2>
          </div>
          <ShieldCheck size={16} color="var(--green)" />
        </div>
        <p style={{ color: "var(--muted)", fontSize: 13 }}>
          Valid approval, exact before-state, one-time idempotency key, write
          audit event, billing reread, and verification must all succeed before
          a Case can resolve.
        </p>
      </section>
    </div>
  );
}
