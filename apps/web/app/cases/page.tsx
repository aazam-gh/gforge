import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { startAcmeAction } from "../actions";
import { acmeSnapshot, dollars } from "../../lib/acme";
import { acmeWorkflow } from "../../lib/workflow";

export const dynamic = "force-dynamic";

export default async function Cases() {
  const [snapshot, workflow] = await Promise.all([
    acmeSnapshot(),
    acmeWorkflow(),
  ]);
  const status = workflow?.currentCase.status ?? "not started";
  return (
    <div className="page">
      <div className="page-title">
        <div>
          <div className="eyebrow" style={{ marginBottom: 15 }}>
            work queue / persisted cases
          </div>
          <h1>Cases</h1>
          <p className="subtitle">
            The Day One queue is backed by the live Acme commercial assurance
            workflow.
          </p>
        </div>
        <form action={startAcmeAction}>
          <button className="button primary" type="submit">
            Run Acme investigation
          </button>
        </form>
      </div>
      <section className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Case</th>
              <th>Account</th>
              <th>Finding</th>
              <th>Status</th>
              <th>Impact</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <Link
                  href={`/cases/${workflow?.currentCase.id ?? "acme"}`}
                  className="mono warn"
                >
                  {workflow?.currentCase.id ?? "ACME-GLOBAL"}
                </Link>
              </td>
              <td>Acme Global</td>
              <td>Commercial terms drift</td>
              <td>
                <span
                  className={`status ${status === "waiting_for_approval" ? "warn" : ""}`}
                >
                  {status}
                </span>
              </td>
              <td className="mono">
                {snapshot ? dollars(snapshot.annualizedLeakageCents) : "—"}
              </td>
            </tr>
          </tbody>
        </table>
        {!workflow ? (
          <p className="subtitle" style={{ marginTop: 18 }}>
            <ClipboardList size={15} /> Run the investigation to create the
            persisted Case and approval proposal.
          </p>
        ) : null}
      </section>
    </div>
  );
}
