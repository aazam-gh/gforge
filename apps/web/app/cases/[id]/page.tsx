import Link from "next/link";
import {
  ChevronLeft,
  CircleAlert,
  FileText,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { acmeSnapshot, dollars } from "../../../lib/acme";
import { startAcmeAction } from "../../actions";
import { acmeWorkflow } from "../../../lib/workflow";
export const dynamic = "force-dynamic";
export default async function CaseDetail() {
  const snapshot = await acmeSnapshot();
  const workflow = await acmeWorkflow();
  if (!snapshot)
    return (
      <div className="page">
        <h1>Commercial Change Assurance</h1>
        <p className="subtitle">
          Persisted Acme state is unavailable. Configure DATABASE_URL, migrate,
          and seed the demo before starting a Case.
        </p>
      </div>
    );
  const expected = snapshot.expected;
  return (
    <div className="page">
      <Link
        href="/cases"
        className="eyebrow"
        style={{
          display: "inline-flex",
          gap: 7,
          alignItems: "center",
          marginBottom: 28,
        }}
      >
        <ChevronLeft size={13} /> all cases
      </Link>
      <div className="case-hero">
        <div>
          <div className="case-id">ACME GLOBAL · EFFECTIVE 2026-07-01</div>
          <h1>Commercial change assurance</h1>
          <p className="subtitle">
            Amendment #3 is governing; billing has not adopted its terms.
          </p>
        </div>
        <form action={startAcmeAction}>
          <button className="button primary" type="submit">
            Run live investigation
          </button>
        </form>
        <div className="impact">
          <strong>{dollars(snapshot.annualizedLeakageCents)}</strong>
          <span>annualized leakage</span>
        </div>
      </div>
      <div
        className="card"
        style={{
          marginBottom: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <span
            className={`status ${workflow?.currentCase.status === "waiting_for_approval" ? "warn" : ""}`}
          >
            {workflow?.currentCase.status ?? "not started"}
          </span>
          <p style={{ fontSize: 12, marginTop: 10, color: "var(--muted)" }}>
            A pricing and billing write cannot execute until an accountable
            Revenue Ops approver grants the persisted request.
          </p>
        </div>
        <span className="mono" style={{ fontSize: 11, color: "var(--muted)" }}>
          owner / revenue ops
        </span>
      </div>
      <div className="grid agent-grid">
        <div className="card agent">
          <div className="agent-top">
            <span className="agent-name">contract_agent</span>
            <FileText size={16} color="var(--green)" />
          </div>
          <p className="agent-result">
            Amendment #3 effective
            <br />
            Platform + Premium Data Processing
          </p>
          <footer>
            <FileText size={12} /> governing evidence
          </footer>
        </div>
        <div className="card agent">
          <div className="agent-top">
            <span className="agent-name">crm_state</span>
            <ShieldCheck size={16} color="var(--green)" />
          </div>
          <p className="agent-result">
            {dollars(expected.platformFeeCents)} platform
            <br />
            0% discount · Premium active
          </p>
          <footer>
            <ShieldCheck size={12} /> operational state
          </footer>
        </div>
        <div className="card agent">
          <div className="agent-top">
            <span className="agent-name">billing_state</span>
            <CircleAlert size={16} color="var(--signal)" />
          </div>
          <p className="agent-result warn">
            {dollars(snapshot.billing.platformFeeCents)} platform
            <br />
            15% discount · Premium missing
          </p>
          <footer>
            <CircleAlert size={12} /> drift detected
          </footer>
        </div>
      </div>
      <div className="grid detail-grid">
        <section className="card">
          <div className="section-head">
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>
                commercial state
              </div>
              <h2>Evidence-backed reconciliation</h2>
            </div>
            <span className="status">
              {expected.governingDocuments.length} documents
            </span>
          </div>
          {[
            [
              "Expected annual billing",
              dollars(expected.expectedAnnualValueCents),
            ],
            [
              "Current annual billing",
              dollars(
                expected.expectedAnnualValueCents -
                  snapshot.annualizedLeakageCents,
              ),
            ],
            ["Annualized impact", dollars(snapshot.annualizedLeakageCents)],
            ["Governing amendment", "Amendment #3 · 2026-07-01"],
            [
              "Evidence",
              expected.evidence
                .map((item) => `${item.documentId}/${item.clauseId}`)
                .join(", "),
            ],
          ].map((row, index) => (
            <div className="evidence-row" key={row[0]}>
              <span>{row[0]}</span>
              <span className={index < 3 ? "warn" : ""}>{row[1]}</span>
            </div>
          ))}
        </section>
        <section className="card">
          <div className="section-head">
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>
                proposed correction
              </div>
              <h2>Update billing terms</h2>
            </div>
            <Lock size={15} color="var(--signal)" />
          </div>
          <div className="card action">
            <div className="mono warn" style={{ fontSize: 11 }}>
              SENSITIVE WRITE
            </div>
            <p
              style={{
                color: "#c9b8a9",
                fontSize: 12,
                lineHeight: 1.55,
                margin: "11px 0 18px",
              }}
            >
              Platform {dollars(snapshot.billing.platformFeeCents)} →{" "}
              {dollars(expected.platformFeeCents)}; discount 15% → 0%; add
              Premium Data Processing at $48,000/year.
            </p>
            <Link
              href="/approvals"
              className="button primary"
              style={{ width: "100%", justifyContent: "center" }}
            >
              {workflow?.currentCase.status === "waiting_for_approval"
                ? "Review exact approval"
                : "Open approval queue"}
            </Link>
          </div>
        </section>
      </div>
      {workflow ? (
        <section className="card" style={{ marginTop: 14 }}>
          <div className="section-head">
            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>
                live case timeline
              </div>
              <h2>{workflow.currentCase.id}</h2>
            </div>
            <span className="status">{workflow.events.length} events</span>
          </div>
          {workflow.events.map((event) => (
            <div className="evidence-row" key={event.id}>
              <span>{event.type}</span>
              <span className="mono">{event.actor}</span>
            </div>
          ))}
          {workflow.verification ? (
            <p
              style={{
                color:
                  workflow.verification.passed === "true"
                    ? "var(--green)"
                    : "var(--signal)",
                marginTop: 14,
              }}
            >
              Verification:{" "}
              {workflow.verification.passed === "true"
                ? "passed — case resolved"
                : "failed"}
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
