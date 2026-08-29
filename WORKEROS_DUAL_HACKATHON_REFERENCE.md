# WorkerOS — Dual-Hackathon Source of Truth

> **Purpose:** This file is the canonical requirements/reference document for Codex and human contributors.
>
> **Project:** WorkerOS
>
> **Flagship demo:** Revenue Integrity Fleet
> **Target hackathons:**
>
> 1. WeMakeDevs / TrueFoundry — The Agent Harness Hackathon
> 2. Google — All Things Agentic Hackathon, **Fortified Enterprise Fleet**
>
> **Rule for Codex:** Do not silently change the product direction or architecture in this file. If implementation reality conflicts with this reference, document the conflict and propose the smallest correction.

> **Implementation evidence:** Checklist items in this canonical reference are requirements, not proof. Current `NOT_STARTED | PARTIAL | VERIFIED | BLOCKED` status and reproducible evidence are maintained in `docs/HACKATHON_SCORECARD.md` and `docs/DEMO_EVIDENCE.md`.

---

## Approved product-direction update — Commercial Change Assurance

Revenue Integrity Fleet remains the flagship. Its first golden segment is **Commercial Change Assurance**: following a material agreement change, WorkerOS establishes the currently effective commercial state from governing evidence, compares it with CRM and billing, and keeps the Case open until a material correction is approved, applied, and independently verified.

For this MVP, the Commercial State Graph is a future conceptual model only. Implement commercial state through typed domain objects and PostgreSQL records; do not introduce a graph database or generic graph platform. The former seat-count reconciliation remains secondary evaluation material. The Acme Global golden case evaluates Amendment #3 at `2026-07-01`: expected annual billing is `$1,332,000`, stale billing is `$1,020,000`, and deterministic annualized leakage is `$312,000`.

---

## 0. Priority labels

- **MUST** — eligibility/submission requirement or core product requirement.
- **SHOULD** — strongly influences judging / winning potential.
- **BONUS** — optional scoring/prize advantage.
- **DEFER** — post-hackathon unless required by the golden demo.
- **DO NOT CLAIM** — do not mention as implemented unless there is real code + visible proof.

---

# 1. Product definition

## WorkerOS

WorkerOS is an **enterprise control plane for governed AI workers**.

Each worker has:

```text
Job
+ SOP / Skills
+ Trigger
+ Tools
+ Data scope
+ Permissions
+ Approval rules
+ Success criteria
+ Persistent state
+ Audit trail
```

WorkerOS is **not** a chatbot and **not** a generic workflow builder.

### Product responsibilities

WorkerOS owns:

- worker/fleet catalog
- business-level job definitions
- cases/work items
- triggers
- tenant/workspace data
- business policy
- approval inbox
- integration configuration
- outcome metrics
- operator UI
- audit/event presentation

### TrueForge responsibilities

TrueForge is the **execution and safety harness**:

- agent loop
- MCP tool access
- tool filtering
- approval-gated actions
- Skills
- sandbox / Code Mode
- persistent sessions
- event streaming
- structured final output
- TrueForge-native subagents where useful

### Google responsibilities

Google supplies the **enterprise specialist-agent fleet and cloud layer**:

- Gemini 3.5+ model
- Google ADK specialist agents
- Gemini Enterprise Agent Runtime
- Memory Bank
- Google Cloud deployment/infrastructure
- enterprise identity/governance/observability capabilities where implemented

---

# 2. Flagship use case — Revenue Integrity Fleet

## Problem

Enterprise revenue data is fragmented across contracts, CRM/account records, entitlements, product usage, and billing systems.

WorkerOS continuously detects and resolves inconsistencies.

## Golden demo case

Synthetic customer:

```text
Customer:           Acme Corp
Contracted seats:   2800
Provisioned seats:  2800
Active usage:       2734
CRM seats:          2800
Billing seats:      2000
```

The system should detect underbilling and calculate a deterministic financial impact.

## Specialist fleet

Minimum real agents:

1. **Contract Agent**
   - understands commercial agreement / pricing / amendments
2. **Usage Agent**
   - checks entitlements, provisioning, and actual usage
3. **Billing Agent**
   - checks invoice/billing state and proposed correction

Optional:

4. **Policy Agent**
   - evaluates escalation/approval requirements

## Golden execution

```text
Trigger / discrepancy detected
        ↓
WorkerOS creates persistent Case
        ↓
TrueForge supervisor session starts
        ↓
SOP / Skill loads
        ↓
Specialist ADK agents investigate
        ↓
Enterprise systems queried through MCP
        ↓
Sandbox / Code Mode reconciles evidence deterministically
        ↓
Revenue mismatch + financial impact confirmed
        ↓
Sensitive billing correction proposed
        ↓
TRUEFORGE APPROVAL GATE
        ↓
Human approves
        ↓
MCP write executes
        ↓
Worker independently re-reads source systems
        ↓
Correction verified
        ↓
Structured Case result + audit timeline
```

### Demo principle

The demo must prove:

> **The agents do not merely recommend an action. They gather evidence, reason across systems, stop at policy boundaries, perform an approved action, and verify the outcome.**

---

# 3. Canonical architecture

```text
                          WORKEROS
                   Enterprise Control Plane
       ┌──────────────────┼───────────────────┐
       │                  │                   │
     Fleet              Cases             Approvals
    Catalog            / State             / Audit
       │                  │                   │
       └──────────────────┼───────────────────┘
                          │
                      Trigger layer
                    (Pub/Sub / manual)
                          │
                          ▼
                     TRUEFORGE
                Supervisor / Harness
       ┌──────────────────┼──────────────────┐
       │                  │                  │
     Skills           Sessions          Event Stream
       │                  │                  │
      MCP            Sandbox/Code         Approval
       │                Mode                Gate
       │
       ├── Enterprise data MCP
       │
       └── ADK Agent Bridge MCP
                 │
                 ▼
       GEMINI ENTERPRISE AGENT PLATFORM
         ┌────────────┼────────────┐
         ▼            ▼            ▼
     Contract       Usage       Billing
     ADK Agent     ADK Agent    ADK Agent
         │            │            │
         └────────────┼────────────┘
                      │
                  Gemini 3.5+
                      │
          Agent Runtime / Memory Bank
                      │
             Google Cloud services
```

## Important implementation detail

**Do not pretend TrueForge dynamic subagents are Google ADK agents.**

Recommended integration boundary:

- TrueForge is the root execution harness.
- Google ADK specialists are real deployed agents.
- Expose specialist delegation to TrueForge through an **MCP bridge** or a typed internal service adapter.
- Example MCP tools:
  - `delegate_contract_analysis`
  - `delegate_usage_analysis`
  - `delegate_billing_analysis`
- Those tools call the corresponding Google ADK agent running on Agent Runtime and return a structured response.

TrueForge-native dynamic subagents may also be used for lightweight parallel research, but are distinct from Google ADK agents.

---

# 4. Technology stack

## Application

- [ ] **MUST** TypeScript strict mode
- [ ] **MUST** Node.js 22+
- [ ] **MUST** pnpm workspace / monorepo
- [ ] **MUST** Next.js + React
- [ ] **SHOULD** Tailwind CSS
- [ ] **SHOULD** shadcn/ui
- [ ] **MUST** Zod schemas at service/agent boundaries
- [ ] **MUST** PostgreSQL
- [ ] **SHOULD** Drizzle ORM

## TrueForge

- [ ] **MUST** `@truefoundry/trueforge-sdk`
- [ ] **MUST** agent actually runs through TrueForge
- [ ] **MUST** MCP tool usage
- [ ] **MUST** explicit approval gate
- [ ] **MUST** sandboxed generated/analysis code
- [ ] **SHOULD** Skills
- [ ] **SHOULD** persistent session across reconnect
- [ ] **SHOULD** structured response schema
- [ ] **SHOULD** event stream visible in WorkerOS UI
- [ ] **SHOULD** subagents where they are genuinely useful

## Google

- [ ] **MUST** Gemini **3.5 or newer**
- [ ] **MUST** at least one accepted Google agent framework
- [ ] **MUST** use **Google ADK** for the specialist fleet
- [ ] **MUST** at least one Google Cloud infrastructure service
- [ ] **SHOULD** Gemini Enterprise **Agent Runtime**
- [ ] **SHOULD** Memory Bank
- [ ] **SHOULD** Agent Platform Sessions where useful
- [ ] **SHOULD** Google Cloud Observability / tracing
- [ ] **SHOULD** Agent Registry/catalog capability
- [ ] **SHOULD** scoped agent identity / IAM
- [ ] **SHOULD** centralized gateway / policy enforcement
- [ ] **SHOULD** Model Armor where practical
- [ ] **DO NOT CLAIM** any Google enterprise capability until actually configured and demonstrated

## Supporting Google Cloud

Preferred:

- [ ] Pub/Sub — asynchronous Case triggers
- [ ] Cloud SQL PostgreSQL — production state
- [ ] Secret Manager — credentials
- [ ] Cloud Logging / Trace — proof + observability

Do not add infrastructure solely for checkbox value.

---

# 5. Google All Things Agentic — universal hard requirements

Official contest period:

- August 3, 2026 09:00 PT → August 31, 2026 17:00 PT

## Application requirements

- [ ] **MUST** build a next-generation autonomous AI agent, beyond a normal chat loop
- [ ] **MUST** use Gemini 3.5+
- [ ] **MUST** use at least one Google Agent Framework:
  - Google ADK, or
  - GenAI SDK, or
  - Antigravity SDK, or
  - GenKit
- [ ] **MUST** use at least one Google Cloud infrastructure service
- [ ] **MUST** select a single competition category
- [ ] **MUST** project was newly created during the contest submission period
- [ ] **MUST** disclose relevant pre-existing code/work incorporated
- [ ] **MUST** be authorized to use all third-party APIs/data/integrations
- [ ] **MUST** function as shown/described in submission
- [ ] **MUST** support English at minimum

## Submission requirements

- [ ] **MUST** project text description:
  - features
  - functionality
  - technologies
  - data sources
  - findings / learnings
- [ ] **MUST** repository URL
  - public OR private
  - if private, grant required judge accounts listed in the official rules
- [ ] **MUST** README with reproducible spin-up instructions
- [ ] **MUST** architecture diagram
- [ ] **MUST** demo video ≤ 4 minutes
- [ ] **MUST** video is public on YouTube or Vimeo
- [ ] **MUST** video shows:
  - problem
  - value proposition
  - application working
  - visible proof backend is running on Google Cloud
- [ ] **SHOULD** hosted project/test build available free to judges through judging period
- [ ] **MUST** English video or English subtitles

## Google judging weights

### Innovation & Operational Utility — 40%

- [ ] clear real-world friction removed
- [ ] high-value autonomous execution
- [ ] not a basic chat query
- [ ] for Fortified Enterprise Fleet:
  - [ ] task genuinely warrants multiple agents
  - [ ] intelligent delegation to specialists
  - [ ] serves an **“Unlikely Hero”** outside standard corporate agent roles

### Architectural Discipline & Tech Stack — 30%

- [ ] clean separation of concerns
- [ ] robust state management
- [ ] failure-tolerant orchestration
- [ ] isolated/scoped tools
- [ ] specialist responsibilities clearly enforced
- [ ] recovery behavior for failed/looping/hallucinating workers
- [ ] structured inter-agent contracts

### Demo & Production Readiness — 30%

- [ ] unedited/live proof of action where possible
- [ ] visible data/tool/system changes
- [ ] architecture explained clearly
- [ ] reproducible README
- [ ] architecture diagram
- [ ] visible Google Cloud deployment proof

## Google optional scoring bonuses

- [ ] **BONUS** public technical content created for the hackathon — up to +0.2
- [ ] **BONUS** social post with `#AllThingsAgenticHackathon` — up to +0.2
- [ ] **BONUS** additional Google AI models such as Gemma/Veo/Lyria — +0.2 each, up to +0.6
- [ ] Only add extra models if they improve the product/demo; do not sacrifice reliability

---

# 6. Google Fortified Enterprise Fleet requirements

Category definition:

> Build a scalable network of institutional agents connected to official enterprise infrastructure.

The system should demonstrate:

## Discovery & lifecycle

- [ ] agent fleet/catalog exists
- [ ] agents have explicit names, roles, owner departments, versions, and statuses
- [ ] agents are discoverable/reusable across departments
- [ ] **SHOULD** demonstrate Agent Registry or a clearly mapped enterprise registry capability

## Core execution & state

- [ ] long-running/asynchronous agent execution
- [ ] persistent Case/work state
- [ ] cross-session context over extended timelines
- [ ] **SHOULD** deploy ADK specialists to Agent Runtime
- [ ] **SHOULD** demonstrate Memory Bank for durable cross-session knowledge
- [ ] separate active-case state from long-term organizational memory

Recommended split:

```text
WorkerOS Case DB      = business workflow state
TrueForge Session     = active execution state
Google Memory Bank    = durable cross-case context
```

## Security & governance

- [ ] every worker has explicit allowed systems/data scopes
- [ ] tool actions are scoped
- [ ] sensitive writes are approval gated
- [ ] audit trail exists
- [ ] credentials are never committed
- [ ] synthetic/de-identified demo data
- [ ] **SHOULD** demonstrate Agent Identity / IAM
- [ ] **SHOULD** demonstrate Agent Gateway or equivalent policy boundary
- [ ] **SHOULD** demonstrate Model Armor where practical
- [ ] clearly document data sovereignty/security assumptions

## Telemetry

- [ ] every Case has ordered events
- [ ] operator can see which agent/tool acted
- [ ] errors and retries are visible
- [ ] approval events are auditable
- [ ] **SHOULD** emit OpenTelemetry-compatible traces / Google Cloud traces

---

# 7. TrueForge / WeMakeDevs — hard requirements

Official hackathon:

- August 24–30, 2026
- Deadline: August 30, 2026 at 8:00 PM London time
- Solo or team of up to 4

## Eligibility / project rules

- [ ] **MUST** agent runs on TrueForge
- [ ] **MUST** judge can visibly see TrueForge doing meaningful work
- [ ] **MUST** open-source submission
- [ ] **MUST** public source-code repository
- [ ] **MUST** judges can read and run project
- [ ] **MUST** project code/design built during hackathon window
- [ ] pre-hackathon planning/notes/diagrams were allowed
- [ ] **MUST** only connect tools/data/accounts team owns or is authorized to use
- [ ] **MUST** no secrets/private/personal data in repo or demo
- [ ] **MUST** disclose AI coding assistant use
- [ ] **MUST** team understands and can explain submitted code/architecture/decisions

## TrueForge submission

- [ ] public source-code repo
- [ ] clear README setup steps
- [ ] demo video about 3 minutes
- [ ] short write-up:
  - what agent does
  - how TrueForge is used
- [ ] blog URL if entering blog prize

---

# 8. TrueForge judging — six equally weighted criteria

## Potential impact

- [ ] job is useful enough to hand to an agent
- [ ] measurable business result
- [ ] flagship: recovered/prevented revenue leakage

## Creativity & originality

- [ ] do not clone official example projects
- [ ] avoid presenting as generic incident responder/code-review/chatbot
- [ ] emphasize Revenue Integrity Fleet + governed workforce platform

## Technical excellence

- [ ] complete golden path
- [ ] deterministic business calculations where possible
- [ ] robust errors/timeouts/retries
- [ ] typed interfaces
- [ ] tests
- [ ] clear architecture
- [ ] reproducible local setup

## Sponsor tools

- [ ] TrueForge is central, not a thin wrapper
- [ ] Qodo review trail exists

## Control & safety

- [ ] sandbox visible
- [ ] irreversible/sensitive billing write cannot happen without approval
- [ ] approval UI shows exact arguments/effect
- [ ] denied approval produces no external write
- [ ] verification after approved action

## Presentation

- [ ] judge understands problem in <20 seconds
- [ ] agent visibly performs real work
- [ ] TrueForge role is obvious
- [ ] approval moment is visible
- [ ] final business outcome is visible

---

# 9. Best Use of TrueForge target checklist

To maximize this prize track, visibly demonstrate:

- [ ] real MCP tool(s)
- [ ] agent-generated or agent-directed code executing in sandbox
- [ ] explicit human approval before sensitive action
- [ ] subagent/delegated work
- [ ] persistent session surviving browser refresh/reconnect
- [ ] Skills loaded for SOP/playbook
- [ ] structured final result
- [ ] real-time TrueForge events feeding WorkerOS UI

Minimum demo proof:

```text
MCP read
→ Skill/SOP
→ delegated investigation
→ sandbox reconciliation
→ approval required
→ human approval
→ real MCP write
→ verification
→ structured completion
```

---

# 10. Best Code Quality / Qodo

**Qodo is required to win the TrueForge Best Code Quality track.**

- [ ] **MUST FOR TRACK** Qodo installed on repository
- [ ] work through real pull requests
- [ ] Qodo reviews each meaningful PR
- [ ] fix legitimate findings before merge
- [ ] respond/explain when intentionally rejecting a finding
- [ ] maintain readable review trail
- [ ] do not create one giant final PR
- [ ] do not push all work directly to `main`

Suggested PR sequence:

1. `chore: scaffold WorkerOS monorepo`
2. `feat: add core data model and synthetic revenue dataset`
3. `feat: add enterprise MCP service`
4. `feat: integrate TrueForge supervisor`
5. `feat: add Google ADK specialist agents`
6. `feat: add case event stream and investigation UI`
7. `feat: add approval-gated billing correction`
8. `feat: add sandbox reconciliation and verification`
9. `test: add golden-path and safety evaluations`
10. `docs: deployment, security, architecture, demo`

Quality gates:

- [ ] lint
- [ ] format
- [ ] TypeScript typecheck
- [ ] unit tests
- [ ] integration tests
- [ ] Python tests
- [ ] production build
- [ ] no secrets
- [ ] README works from a clean clone

---

# 11. Best UI requirements

WorkerOS should be an operations/control-plane interface, not a chat-first UI.

Required screens:

- [ ] `/fleet`
- [ ] `/cases`
- [ ] `/cases/[id]`
- [ ] `/approvals`

## Case detail must show

- [ ] current Case state
- [ ] specialists currently working
- [ ] real ordered event timeline
- [ ] source evidence
- [ ] financial impact
- [ ] SOP/policy used
- [ ] proposed corrective action
- [ ] exact approval requirement
- [ ] approval/rejection state
- [ ] verification outcome

Judge should always be able to answer:

1. What is the worker doing?
2. What is it waiting for?
3. What has it already done?
4. What evidence supports its conclusion?
5. What action requires a human?
6. What happened after approval?

---

# 12. Core data model

Minimum entities:

```text
Workspace
Worker
AgentDefinition
AgentVersion
Case
CaseEvent
Approval
Integration
Policy
Outcome
```

## Case states

```text
QUEUED
INVESTIGATING
WAITING_FOR_APPROVAL
EXECUTING
VERIFYING
RESOLVED
FAILED
```

## AgentDefinition

Include:

- id
- name
- role
- owning department
- purpose
- version
- status
- model/framework
- allowed data scopes
- allowed tools
- approval-required tools
- skill/SOP references
- success criteria

---

# 13. MCP requirements

Create real tools over synthetic demo data.

## Read tools

- [ ] `get_account`
- [ ] `get_contract`
- [ ] `get_usage_summary`
- [ ] `get_entitlements`
- [ ] `get_billing_state`
- [ ] `get_crm_state`

## Sensitive write

- [ ] `update_billing_quantity`

## Safe write

- [ ] `add_crm_note`

Rules:

- [ ] data lives in actual local/Cloud SQL tables, not hard-coded tool responses
- [ ] MCP responses are structured
- [ ] tool descriptions clearly state read/write semantics
- [ ] sensitive action is explicitly approval-gated in TrueForge
- [ ] application code must not bypass approval
- [ ] all writes produce CaseEvent/audit evidence
- [ ] denied approval causes zero state change

---

# 14. Skills / SOP requirements

Revenue Integrity Skill must instruct:

- [ ] independently reconcile contract, entitlement, usage, CRM, and billing
- [ ] never infer material financial mismatch from a single source
- [ ] distinguish underbilling vs overbilling
- [ ] calculate financial impact deterministically where possible
- [ ] cite/store evidence used
- [ ] apply company escalation rules
- [ ] require approval before customer billing changes
- [ ] after correction, re-read systems and verify
- [ ] never mark Case resolved without verification

---

# 15. Specialist-agent contracts

Every ADK specialist returns structured data, not prose-only output.

Example schema:

```json
{
  "agent": "billing_agent",
  "status": "completed",
  "summary": "Billing quantity is 2000 seats.",
  "facts": [
    {
      "key": "billing_seats",
      "value": 2000,
      "source": "billing_account"
    }
  ],
  "risks": [],
  "confidence": 0.98,
  "requires_followup": false
}
```

- [ ] Zod/Pydantic-compatible contract documented
- [ ] timeout defined
- [ ] retry behavior defined
- [ ] invalid response rejected
- [ ] specialist failure does not cause supervisor to hallucinate a result
- [ ] supervisor explicitly reports incomplete evidence

---

# 16. Safety acceptance tests

These are non-negotiable.

- [ ] billing update never runs without recorded approval
- [ ] rejection leaves billing state unchanged
- [ ] malformed billing request is rejected
- [ ] agent cannot access tools outside allowlist
- [ ] missing source evidence prevents material correction
- [ ] specialist failure becomes visible Case error
- [ ] duplicate approval cannot execute write twice
- [ ] verification failure keeps Case open/escalated
- [ ] secrets absent from frontend/event logs
- [ ] synthetic dataset clearly marked synthetic

---

# 17. Google enterprise-memory model

Use three layers intentionally:

## WorkerOS/Postgres

Stores:

- fleet definitions
- Cases
- business state
- approvals
- event index
- outcomes

## TrueForge session

Stores:

- active agent execution
- tool/action context
- active Case continuity
- turn/event sequence

## Google Memory Bank

Stores durable context useful across Cases, for example:

- account-level operating context
- historical approved exceptions
- relevant non-sensitive commercial facts
- prior discrepancy patterns

Rules:

- [ ] never use Memory Bank as the system of record for billing/contract truth
- [ ] do not persist secrets
- [ ] do not rely solely on Memory Bank to filter sensitive data
- [ ] source-of-truth systems must be re-read for consequential actions

---

# 18. Local development

Preferred local topology:

```text
Next.js WorkerOS
      │
WorkerOS API
      │
Local TrueForge
      │
Enterprise MCP ─── Local Postgres
      │
ADK bridge ─────── Google ADK / dev endpoint
```

TrueForge local start:

```bash
npx @truefoundry/trueforge
```

Desired repository setup:

```bash
pnpm install
docker compose up -d
pnpm db:migrate
pnpm db:seed
pnpm dev
```

- [ ] `.env.example`
- [ ] no real credentials committed
- [ ] local synthetic demo works without production accounts
- [ ] document separate setup for Google Cloud credentials

---

# 19. Production/demo deployment target

Preferred Google deployment:

```text
Google Cloud
├── WorkerOS web/API
├── Cloud SQL Postgres
├── Pub/Sub triggers
├── Secret Manager
├── Google ADK specialist agents
│    └── Gemini Enterprise Agent Runtime
├── Memory Bank
└── Cloud Logging / Trace

TrueForge
└── deployed securely on Google Cloud/private network
```

- [ ] TrueForge must not be publicly exposed in insecure no-auth local mode
- [ ] expose only required application endpoints
- [ ] use TLS
- [ ] credentials in Secret Manager/environment configuration
- [ ] judge/test path documented
- [ ] demo video contains visible proof of Google Cloud backend execution

---

# 20. Demo — one product, two cuts

## Shared golden run

1. discrepancy event arrives / Case opens
2. TrueForge session begins
3. Skill/SOP loads
4. Contract, Usage, Billing specialists investigate
5. MCP source data appears
6. sandbox/Code Mode reconciles data
7. mismatch and financial impact shown
8. correction proposed
9. human approval required
10. approve
11. billing correction executes
12. systems re-read
13. integrity verified
14. Case resolves
15. WorkerOS Fleet view zoom-out

## TrueForge video (~3 minutes)

Emphasize:

- TrueForge is central
- MCP
- Skills
- subagents/delegation
- sandbox
- approval
- persistent session
- real action
- verification
- UI/event stream

## Google video (≤4 minutes)

Use same run, plus:

- Gemini 3.5+
- ADK specialists
- why multi-agent design is necessary
- Agent Runtime
- Memory Bank
- enterprise governance boundaries
- architecture diagram
- Google Cloud deployment proof/logs
- WorkerOS fleet/catalog

---

# 21. Evaluation suite

Create deterministic scenarios.

Minimum:

- [ ] billing < contract/entitlement → likely underbilling
- [ ] billing > contract → potential overbilling
- [ ] billing equals contract → no discrepancy
- [ ] contract amendment makes apparent mismatch valid
- [ ] usage lower than contracted seats but fixed-seat contract → no automatic reduction
- [ ] missing contract → escalate
- [ ] conflicting contract sources → escalate
- [ ] sensitive correction → approval required
- [ ] rejected approval → no write
- [ ] approved correction → verification required
- [ ] specialist timeout → incomplete evidence / safe failure

Measure:

- discrepancy classification accuracy
- tool choice correctness
- approval compliance
- verification compliance
- agent response-schema validity
- end-to-end Case completion rate

Never invent metrics. Only publish measured results.

---

# 22. Observability requirements

Every Case should make these visible:

```text
case_id
worker_id
agent_id
session_id
event_id
event_type
tool_name
timestamp
latency
status
approval_id
error_code
```

- [ ] correlate TrueForge events to WorkerOS CaseEvents
- [ ] correlate Google agent execution/traces to Case ID
- [ ] log specialist latency and failure
- [ ] never expose reasoning/private chain-of-thought
- [ ] store operational trace/evidence, not hidden model reasoning

---

# 23. Repo structure target

```text
workeros/
├── apps/
│   └── web/
├── services/
│   ├── enterprise-mcp/
│   ├── adk-agents/
│   └── adk-mcp-bridge/
├── packages/
│   ├── db/
│   ├── contracts/
│   ├── trueforge/
│   ├── policy/
│   └── observability/
├── workers/
│   └── revenue-integrity/
│       ├── worker.yaml
│       └── skills/
│           └── revenue-integrity/
│               └── SKILL.md
├── fixtures/
│   └── demo-enterprise/
├── evals/
├── docs/
│   ├── architecture.md
│   ├── security.md
│   ├── google-enterprise-fleet.md
│   ├── trueforge.md
│   └── demo.md
├── infra/
│   ├── docker/
│   └── gcp/
└── .github/workflows/
```

---

# 24. Feature priority

## P0 — must work

- [ ] synthetic dataset
- [ ] enterprise MCP reads
- [ ] TrueForge supervisor
- [ ] real Skill
- [ ] specialist delegation
- [ ] deterministic reconciliation
- [ ] approval gate
- [ ] billing write
- [ ] verification
- [ ] Case event timeline
- [ ] reproducible repo
- [ ] Qodo PR trail

## P1 — strong judging leverage

- [ ] Agent Runtime deployment
- [ ] Memory Bank
- [ ] TrueForge persistent reconnect demo
- [ ] Cloud observability
- [ ] eval suite
- [ ] polished Fleet/Case/Approval UI
- [ ] hosted Google Cloud project

## P2 — only if P0/P1 stable

- [ ] second lightweight worker
- [ ] advanced agent catalog/version UX
- [ ] Agent Gateway integration
- [ ] Model Armor
- [ ] richer enterprise identity
- [ ] extra Google AI model for bonus

## DEFER

- visual workflow builder
- billing for WorkerOS itself
- enterprise SSO/RBAC productization
- marketplace
- dozens of integrations
- real customer financial data
- mobile app
- Kubernetes unless clearly necessary

---

# 25. Codex operating rules

When implementing from this reference:

1. Read this entire file before changing architecture.
2. Prefer a working vertical slice over broad scaffolding.
3. Never mock a successful external action and present it as real.
4. Synthetic external systems are acceptable, but must be backed by real state and real tool calls.
5. Keep TrueForge central to execution.
6. Keep Google ADK specialists materially useful.
7. Do not duplicate the same orchestration responsibilities unnecessarily.
8. Keep framework adapters separate from domain/business logic.
9. Use structured schemas at all cross-service/agent boundaries.
10. Add tests for every sensitive action.
11. Sensitive writes must fail closed.
12. Every meaningful feature goes through a PR reviewed by Qodo.
13. Keep README/setup updated as architecture changes.
14. Update checkboxes in this document only when there is verifiable implementation.
15. Add `IMPLEMENTED:` notes with file paths beside major completed requirements.
16. Never claim a Google/TrueForge capability in docs/demo unless it is actually wired and demonstrable.
17. Preserve a clean golden demo path above all optional features.

---

# 26. Final submission gate — TrueForge

Before submission:

- [ ] registered/eligible team, max 4
- [ ] public open-source repo
- [ ] project built within allowed window
- [ ] README works
- [ ] AI coding-assistant use disclosed
- [ ] TrueForge visibly central
- [ ] real MCP tool
- [ ] sandbox execution
- [ ] human approval
- [ ] sensitive write
- [ ] verification
- [ ] Qodo PR history
- [ ] no secrets/private data
- [ ] ~3-minute demo
- [ ] short TrueForge write-up
- [ ] optional blog URL
- [ ] social build posts/tag requirements checked

---

# 27. Final submission gate — Google

Before submission:

- [ ] category = **Fortified Enterprise Fleet**
- [ ] Gemini 3.5+
- [ ] Google ADK
- [ ] Google Cloud infrastructure
- [ ] new project during contest period
- [ ] app functions as demoed
- [ ] all third-party tools authorized
- [ ] hosted/testable project where possible
- [ ] repo URL
- [ ] README spin-up steps
- [ ] architecture diagram
- [ ] project description
- [ ] technologies/data sources/learnings
- [ ] ≤4-minute public YouTube/Vimeo video
- [ ] English/subtitles
- [ ] visible Google Cloud execution proof
- [ ] multi-agent necessity is obvious
- [ ] “Unlikely Hero” positioning is explicit
- [ ] governance/state/security explained
- [ ] optional content bonus
- [ ] optional social bonus
- [ ] project remains available for judging period

---

# 28. Official / canonical references

## WeMakeDevs / TrueForge Hackathon

- Hackathon home: https://www.wemakedevs.org/hackathons/trueforge
- Official rules: https://www.wemakedevs.org/hackathons/trueforge/rules

## TrueForge

- Docs: https://trueforge.dev/
- Create an Agent: https://trueforge.dev/create-agent/overview
- MCP Servers: https://trueforge.dev/mcp-servers
- Skills: https://trueforge.dev/skills
- Sandbox: https://trueforge.dev/sandbox
- SDK/API concepts: https://trueforge.dev/api/overview
- GitHub: https://github.com/truefoundry/trueforge

## Qodo

- Docs: https://docs.qodo.ai/
- Getting started: https://docs.qodo.ai/get-started
- Code review: https://docs.qodo.ai/code-review
- Open source: https://www.qodo.ai/solutions/open-source/

## Google All Things Agentic Hackathon

- Hackathon: https://allthingsagentichackathon.devpost.com/
- Official rules: https://allthingsagentichackathon.devpost.com/rules
- FAQ: https://allthingsagentichackathon.devpost.com/details/faqs
- Resources: https://allthingsagentichackathon.devpost.com/resources

## Gemini Enterprise Agent Platform

- Platform overview: https://docs.cloud.google.com/gemini-enterprise-agent-platform/overview
- Documentation home: https://docs.cloud.google.com/gemini-enterprise-agent-platform
- Agent Runtime: https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/runtime
- Memory Bank: https://docs.cloud.google.com/gemini-enterprise-agent-platform/scale/memory-bank
- Announcement: https://cloud.google.com/blog/products/ai-machine-learning/introducing-gemini-enterprise-agent-platform

---

# 29. Immediate next implementation milestone

Do not start by building the entire platform.

First prove this vertical slice:

```text
Seed Acme Corp data
      ↓
TrueForge session starts
      ↓
MCP reads contract + usage + billing
      ↓
at least one real Google ADK specialist returns structured evidence
      ↓
reconciliation identifies mismatch
      ↓
TrueForge requests approval for billing correction
      ↓
human approves
      ↓
MCP changes database state
      ↓
agent re-reads and verifies
      ↓
WorkerOS Case shows resolved event timeline
```

**Definition of done:** the sequence above works locally, repeatedly, without fake success states.

Only after this passes should the team spend significant time on extra workers, Memory Bank polish, advanced fleet management, or additional infrastructure.
