#!/usr/bin/env bash
set -euo pipefail

# Starts the Day One UI and MCP against the isolated Cloud SQL runtime database.
# The generated database password is kept in this process environment only.

for required in TRUEFORGE_BASE_URL TRUEFORGE_AGENT_NAME; do
  if [[ -z "${!required:-}" ]]; then
    echo "$required must be set to run the live supervised workflow" >&2
    exit 1
  fi
done

project_id="workeros-demo-20260825"
instance_name="workeros-postgres"
connection_name="${project_id}:us-central1:${instance_name}"
runtime_user="workeros_runtime"
runtime_database="workeros_runtime"

command -v cloud-sql-proxy >/dev/null || {
  echo "cloud-sql-proxy is required; install it with: brew install cloud-sql-proxy" >&2
  exit 1
}
gcloud auth application-default print-access-token >/dev/null

runtime_password="$(openssl rand -hex 32)"
gcloud sql users set-password "$runtime_user" \
  --instance="$instance_name" \
  --project="$project_id" \
  --password="$runtime_password" >/dev/null

proxy_pid=""
mcp_pid=""
cleanup() {
  [[ -n "$mcp_pid" ]] && kill "$mcp_pid" 2>/dev/null || true
  [[ -n "$proxy_pid" ]] && kill "$proxy_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

if ! lsof -nP -iTCP:5432 -sTCP:LISTEN >/dev/null 2>&1; then
  cloud-sql-proxy "$connection_name" --address 127.0.0.1 --port 5432 &
  proxy_pid="$!"
  sleep 2
fi

export DATABASE_URL="postgres://${runtime_user}:${runtime_password}@127.0.0.1:5432/${runtime_database}"
export WORKEROS_MCP_URL="${WORKEROS_MCP_URL:-http://127.0.0.1:4000/mcp}"
export WORKEROS_ADK_URL="${WORKEROS_ADK_URL:-http://127.0.0.1:8001}"
export WORKEROS_APPROVER_ID="${WORKEROS_APPROVER_ID:-revenue-ops-demo}"
export WORKEROS_APPROVER_WORKSPACE_ID="${WORKEROS_APPROVER_WORKSPACE_ID:-acme-operations}"
export WORKEROS_APPROVER_ROLES="${WORKEROS_APPROVER_ROLES:-revenue_ops}"

if lsof -nP -iTCP:4000 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "port 4000 is already in use; stop the existing MCP process before starting Day One" >&2
  exit 1
fi

pnpm mcp:dev &
mcp_pid="$!"
sleep 2
curl -fsS "$WORKEROS_ADK_URL/health" >/dev/null || {
  echo "ADK service is not reachable at $WORKEROS_ADK_URL" >&2
  exit 1
}
pnpm --filter @workeros/web dev
