#!/usr/bin/env bash
set -euo pipefail

# Starts the local WorkerOS MCP against the isolated Cloud SQL runtime database.
# A fresh password is generated for the dedicated user on every launch and is
# passed only to the child MCP process; it is never written to disk.

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
if ! lsof -nP -iTCP:5432 -sTCP:LISTEN >/dev/null 2>&1; then
  cloud-sql-proxy "$connection_name" --address 127.0.0.1 --port 5432 &
  proxy_pid="$!"
  trap '[[ -n "$proxy_pid" ]] && kill "$proxy_pid" 2>/dev/null || true' EXIT
  sleep 2
fi

export DATABASE_URL="postgres://${runtime_user}:${runtime_password}@127.0.0.1:5432/${runtime_database}"
exec pnpm mcp:dev
