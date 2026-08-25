import { describe, expect, it } from "vitest";
import { createEnterpriseMcpServer } from "./server";
describe("enterprise MCP", () =>
  it("creates the database-backed MCP boundary", () =>
    expect(createEnterpriseMcpServer()).toBeDefined()));
