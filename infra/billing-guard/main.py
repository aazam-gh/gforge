import base64
import json
import os

import functions_framework
from google.cloud import billing_v1
from googleapiclient.discovery import build


PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]
INSTANCE_ID = os.environ.get("CLOUD_SQL_INSTANCE", "workeros-postgres")
EXPECTED_BILLING_ACCOUNT_ID = os.environ["EXPECTED_BILLING_ACCOUNT_ID"]
EXPECTED_BUDGET_ID = os.environ["EXPECTED_BUDGET_ID"]


def _validate_notification(event):
    attributes = event.data["message"].get("attributes", {})
    billing_account_id = attributes.get("billingAccountId")
    budget_id = attributes.get("budgetId")
    if billing_account_id != EXPECTED_BILLING_ACCOUNT_ID:
        raise ValueError("Budget notification billing account does not match")
    if budget_id != EXPECTED_BUDGET_ID:
        raise ValueError("Budget notification budget does not match")


def _payload(event):
    encoded = event.data["message"]["data"]
    return json.loads(base64.b64decode(encoded).decode("utf-8"))


def _stop_cloud_sql():
    sqladmin = build("sqladmin", "v1", cache_discovery=False)
    return sqladmin.instances().patch(
        project=PROJECT_ID,
        instance=INSTANCE_ID,
        body={"settings": {"activationPolicy": "NEVER"}},
    ).execute()


def _disable_vertex_ai():
    serviceusage = build("serviceusage", "v1", cache_discovery=False)
    return serviceusage.services().disable(
        name=f"projects/{PROJECT_ID}/services/aiplatform.googleapis.com",
        body={},
    ).execute()


def _disable_billing():
    billing = billing_v1.CloudBillingClient()
    return billing.update_project_billing_info(
        name=f"projects/{PROJECT_ID}",
        project_billing_info=billing_v1.ProjectBillingInfo(billing_account_name=""),
    )


def _attempt_action(name, action, failures):
    try:
        action()
        print(f"Budget guard action succeeded: {name}")
    except Exception as error:  # noqa: BLE001 - all actions must be attempted
        failures.append((name, error))
        print(f"Budget guard action failed: {name}: {error}")


@functions_framework.cloud_event
def enforce_budget(cloud_event):
    _validate_notification(cloud_event)
    payload = _payload(cloud_event)
    cost = float(payload.get("costAmount", 0))
    budget = float(payload.get("budgetAmount", 0))
    if budget <= 0 or cost < budget:
        print(f"Budget guard inactive: cost={cost} budget={budget}")
        return

    print(f"Budget threshold reached: cost={cost} budget={budget}")
    failures = []
    _attempt_action("Cloud SQL shutdown", _stop_cloud_sql, failures)
    _attempt_action("Vertex AI disablement", _disable_vertex_ai, failures)
    if os.environ.get("DISABLE_PROJECT_BILLING", "true").lower() == "true":
        _attempt_action("project billing disablement", _disable_billing, failures)

    if failures:
        details = "; ".join(f"{name}: {error}" for name, error in failures)
        raise RuntimeError(f"Budget guard actions failed: {details}")

    if os.environ.get("DISABLE_PROJECT_BILLING", "true").lower() == "true":
        print("Project billing disabled")
