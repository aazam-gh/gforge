#!/usr/bin/env bash
set -euo pipefail

trueforge_base_url="${TRUEFORGE_BASE_URL:?TRUEFORGE_BASE_URL is required}"
trueforge_agent_name="${TRUEFORGE_AGENT_NAME:?TRUEFORGE_AGENT_NAME is required}"
project_id="${GOOGLE_CLOUD_PROJECT:-workeros-demo-20260825}"
location="${GOOGLE_CLOUD_LOCATION:-global}"
model_id="${WORKEROS_VERTEX_MODEL:-gemini-3.5-flash}"

case "$trueforge_base_url" in
  http://localhost:*|http://127.0.0.1:*) ;;
  *)
    echo "Refusing to send an ADC access token to non-local TrueForge: $trueforge_base_url" >&2
    exit 1
    ;;
esac

for command_name in curl gcloud jq; do
  command -v "$command_name" >/dev/null || {
    echo "$command_name is required" >&2
    exit 1
  }
done

gcloud auth application-default print-access-token >/dev/null
vertex_base_url="${WORKEROS_ADK_URL:-http://127.0.0.1:8001}/v1"

provider_payload="$(jq -nc \
  --arg token "local-adc-proxy" \
  --arg base_url "$vertex_base_url" \
  --arg model_id "google/${model_id}" \
  --arg model_name "${model_id//./-}" \
  '{manifest:{type:"custom",name:"google-vertex",base_url:$base_url,auth:{api_key:$token},models:[{model_id:$model_id,name:$model_name,properties:{context_length:1048576,max_output_tokens:65536,reasoning_efforts:["minimal","low","medium","high"]}}]}}')"

curl -fsS -X PUT \
  -H 'content-type: application/json' \
  --data-binary "$provider_payload" \
  "$trueforge_base_url/api/v1/settings/model-providers" >/dev/null

agent_record="$(curl -fsS "$trueforge_base_url/api/v1/agents" | jq -c \
  --arg name "$trueforge_agent_name" '.data[] | select(.name == $name)')"
if [[ -z "$agent_record" ]]; then
  echo "TrueForge agent not found: $trueforge_agent_name" >&2
  exit 1
fi
agent_id="$(jq -r '.id' <<<"$agent_record")"
agent_payload="$(jq -c \
  --arg model "google-vertex/${model_id//./-}" \
  '.manifest.model = {name:$model,params:{reasoning_effort:"low"}} | {manifest:.manifest}' \
  <<<"$agent_record")"

curl -fsS -X PUT \
  -H 'content-type: application/json' \
  --data-binary "$agent_payload" \
  "$trueforge_base_url/api/v1/agents/$agent_id" >/dev/null

echo "TrueForge configured for Vertex AI $model_id through the local ADC bridge."
