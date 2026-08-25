import type { NextConfig } from "next";
export default {
  transpilePackages: [
    "@workeros/contracts",
    "@workeros/db",
    "@workeros/operations",
    "@workeros/trueforge",
  ],
} satisfies NextConfig;
