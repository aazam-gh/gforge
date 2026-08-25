export const SENSITIVE_TOOLS = new Set([
  "update_billing_quantity",
  "update_billing_terms",
]);
export function requiresApproval(toolName: string) {
  return SENSITIVE_TOOLS.has(toolName);
}
export function assertApprovedWrite(
  toolName: string,
  approval:
    { decision: string; consumedAt?: Date | null; expiresAt: Date } | undefined,
) {
  if (!requiresApproval(toolName)) return;
  if (
    !approval ||
    approval.decision !== "approved" ||
    approval.consumedAt ||
    approval.expiresAt <= new Date()
  )
    throw new Error("APPROVAL_REQUIRED_OR_INVALID");
}
