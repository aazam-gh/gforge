import "server-only";

export type ApproverSession = {
  userId: string;
  workspaceId: string;
  roles: string[];
};

/**
 * Development session boundary for the seeded Revenue Ops approver.
 * Production must replace this provider with the deployed identity session.
 */
export async function getAuthenticatedServerSession(): Promise<ApproverSession> {
  const userId = process.env.WORKEROS_APPROVER_ID?.trim();
  const workspaceId = process.env.WORKEROS_APPROVER_WORKSPACE_ID?.trim();
  const roles = (process.env.WORKEROS_APPROVER_ROLES ?? "")
    .split(",")
    .map((role) => role.trim())
    .filter(Boolean);
  if (!userId || !workspaceId || roles.length === 0)
    throw new Error("AUTHENTICATION_REQUIRED");
  return { userId, workspaceId, roles };
}
