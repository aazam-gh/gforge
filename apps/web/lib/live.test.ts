import { describe, expect, it, vi } from "vitest";
import { closeMcpClient } from "./mcp-client";

describe("closeMcpClient", () => {
  it("accepts the SDK AbortError emitted during normal transport shutdown", async () => {
    const client = {
      close: vi
        .fn()
        .mockRejectedValue(new DOMException("closed", "AbortError")),
    };

    await expect(closeMcpClient(client)).resolves.toBeUndefined();
  });

  it("surfaces unexpected close failures", async () => {
    const failure = new Error("socket cleanup failed");
    const client = { close: vi.fn().mockRejectedValue(failure) };

    await expect(closeMcpClient(client)).rejects.toBe(failure);
  });
});
