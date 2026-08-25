"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { approveLiveAcmeCase, startLiveAcmeInvestigation } from "../lib/live";
import { getAuthenticatedServerSession } from "../lib/session";

export async function startAcmeAction() {
  const result = await startLiveAcmeInvestigation();
  revalidatePath("/cases");
  revalidatePath("/approvals");
  redirect(`/cases/${result.caseId}`);
}

export async function approveAcmeAction(formData: FormData) {
  const caseId = String(formData.get("caseId") ?? "");
  if (!caseId) throw new Error("CASE_ID_REQUIRED");
  const session = await getAuthenticatedServerSession();
  await approveLiveAcmeCase(caseId, session);
  revalidatePath("/cases");
  revalidatePath(`/cases/${caseId}`);
  revalidatePath("/approvals");
  redirect(`/cases/${caseId}`);
}
