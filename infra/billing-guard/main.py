import base64
import json
import os

import functions_framework
from google.cloud import billing_v1
from googleapiclient.discovery import build


PROJECT_ID = os.environ["GOOGLE_CLOUD_PROJECT"]
INSTANCE_ID = os.environ.get("CLOUD_SQL_INSTANCE", "workeros-postgres")


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


@functions_framework.cloud_event
def enforce_budget(cloud_event):
    payload = _payload(cloud_event)
    cost = float(payload.get("costAmount", 0))
    budget = float(payload.get("budgetAmount", 0))
    if budget <= 0 or cost < budget:
        print(f"Budget guard inactive: cost={cost} budget={budget}")
        return

    print(f"Budget threshold reached: cost={cost} budget={budget}")
    _stop_cloud_sql()
    _disable_vertex_ai()
    if os.environ.get("DISABLE_PROJECT_BILLING", "true").lower() == "true":
        _disable_billing()
        print("Project billing disabled")
