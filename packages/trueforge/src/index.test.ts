import { describe, expect, it } from "vitest";
import { consumeTurnStream, TrueForgeAdapter } from "./index";
describe("TrueForge adapter", () => {
  it("is explicit when unavailable", () =>
    expect(new TrueForgeAdapter({}).state).toBe("unavailable"));
  it("never creates a fake session without configuration", async () =>
    await expect(
      new TrueForgeAdapter({}).createOrReuseSession(),
    ).rejects.toThrow("TRUEFORGE_UNAVAILABLE"));
});

describe("consumeTurnStream", () => {
  async function* stream(values: unknown[]) {
    yield* values;
  }

  it("waits for a successful terminal turn", async () => {
    const events = [
      {
        id: "event-1",
        type: "turn.created" as const,
        turnId: "turn-1",
        threadId: null,
        previousTurnId: null,
        createdAt: new Date().toISOString(),
        state: { status: "running" as const },
      },
      {
        id: "event-2",
        type: "turn.done" as const,
        threadId: null,
        createdAt: new Date().toISOString(),
        state: {
          status: "done" as const,
          completedAt: new Date().toISOString(),
          output: null,
          requiredActions: [],
        },
      },
    ];

    await expect(consumeTurnStream(stream(events))).resolves.toMatchObject({
      turnId: "turn-1",
      requiredActions: [],
    });
  });

  it("fails closed when TrueForge reports an execution error", async () => {
    const events = [
      {
        id: "event-1",
        type: "turn.created" as const,
        turnId: "turn-1",
        threadId: null,
        previousTurnId: null,
        createdAt: new Date().toISOString(),
        state: { status: "running" as const },
      },
      {
        id: "event-2",
        type: "turn.done" as const,
        threadId: null,
        createdAt: new Date().toISOString(),
        state: {
          status: "error" as const,
          completedAt: new Date().toISOString(),
          message: "provider quota exhausted",
        },
      },
    ];

    await expect(consumeTurnStream(stream(events))).rejects.toThrow(
      "TRUEFORGE_TURN_FAILED: provider quota exhausted",
    );
  });

  it("fails closed when the stream ends before a terminal event", async () => {
    const events = [
      {
        id: "event-1",
        type: "turn.created" as const,
        turnId: "turn-1",
        threadId: null,
        previousTurnId: null,
        createdAt: new Date().toISOString(),
        state: { status: "running" as const },
      },
    ];

    await expect(consumeTurnStream(stream(events))).rejects.toThrow(
      "TRUEFORGE_TURN_TERMINAL_EVENT_MISSING",
    );
  });
});
