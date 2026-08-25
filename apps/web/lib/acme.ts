import { compileAcmeReconciliation } from "@workeros/operations";
export async function acmeSnapshot() {
  try {
    return await compileAcmeReconciliation("acme-global");
  } catch {
    return null;
  }
}
export const dollars = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
