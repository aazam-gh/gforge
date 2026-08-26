# WorkerOS billing guard

This Cloud Run function consumes Cloud Billing budget notifications. At or
above the configured budget it stops the Cloud SQL instance, disables the
Vertex AI API, and removes the billing account from the project.

The current billing account is denominated in INR, so the provisioned budget
is ₹500. The budget is scoped only to
`workeros-demo-20260825` and uses current-spend thresholds at 50%, 80%, and
100%.

The function requires `EXPECTED_BILLING_ACCOUNT_ID`, `EXPECTED_BUDGET_ID`, and
`EXPECTED_BUDGET_AMOUNT` environment variables. It validates the
`billingAccountId` and `budgetId` Pub/Sub attributes before decoding threshold
data or invoking any shutdown action. It uses the configured budget amount
rather than the notification's `budgetAmount`, because queued notifications
can contain the value from before a budget edit. For the provisioned resources
these are `01C9B6-77F938-FAB821`,
`16fb32d9-18e1-4cd0-a95d-7a4ac56c3b84`, and `500`, respectively. Budget
notifications are estimates and may arrive after spend has crossed a
threshold.

Project-wide billing disablement is intentionally the final action. It stops
all billable project services, including this function, and must be manually
re-enabled in the Cloud Console before the project can run again. Budget
notifications are delayed estimates, so this is a safety net rather than an
exact hard cap.
