import { TrueForge } from "@truefoundry/trueforge-sdk";
export type TrueForgeState = "connected" | "unavailable";
type Env = Record<string, string | undefined>;
const env = () =>
  (globalThis as { process?: { env?: Env } }).process?.env ?? {};
export class TrueForgeAdapter {
  readonly state: TrueForgeState;
  private readonly client?: TrueForge;
  private readonly agentName?: string;
  constructor(config = env()) {
    this.agentName = config.TRUEFORGE_AGENT_NAME;
    this.state =
      config.TRUEFORGE_BASE_URL && this.agentName ? "connected" : "unavailable";
    if (this.state === "connected")
      this.client = new TrueForge({
        baseUrl: config.TRUEFORGE_BASE_URL!,
        ...(config.TRUEFORGE_TOKEN ? { token: config.TRUEFORGE_TOKEN } : {}),
      });
  }
  private configured() {
    if (!this.client || !this.agentName)
      throw new Error(
        "TRUEFORGE_UNAVAILABLE: configure TRUEFORGE_BASE_URL and TRUEFORGE_AGENT_NAME; add TRUEFORGE_TOKEN only when the tenant requires authentication",
      );
    return this.client;
  }
  private unwrap<T>(value: T | { data: T }): T {
    return value && typeof value === "object" && "data" in value
      ? value.data
      : value;
  }
  async createOrReuseSession(existingSessionId?: string) {
    const client = this.configured();
    const response = existingSessionId
      ? client.sessions.get(existingSessionId)
      : client.sessions.create({ agent: { name: this.agentName! } });
    return this.unwrap(await response);
  }
  async submitTurn(sessionId: string, input: Record<string, unknown>) {
    const stream = await this.configured().sessions.createTurnStream(
      sessionId,
      {
        input: [{ type: "user.message", content: JSON.stringify(input) }],
      },
    );
    return consumeTurnStream(stream);
  }
  async subscribeToEvents(sessionId: string, turnId: string) {
    return this.configured().sessions.subscribeToTurn(sessionId, turnId);
  }
  async retrieveSession(sessionId: string) {
    return this.unwrap(await this.configured().sessions.get(sessionId));
  }
  async listEvents(sessionId: string) {
    return this.configured().sessions.listEvents(sessionId);
  }
  mapEventToCaseEvent(event: unknown) {
    return { type: "trueforge.event", actor: "trueforge", payload: event };
  }
}

export async function consumeTurnStream(stream: AsyncIterable<unknown>) {
  const events: unknown[] = [];
  let turnId = "";
  let terminal = false;
  let requiredActions: unknown[] = [];
  for await (const value of stream) {
    if (!value || typeof value !== "object")
      throw new Error("TRUEFORGE_EVENT_INVALID");
    const event = value as {
      type?: string;
      turnId?: string;
      state?: {
        status?: string;
        error?: string;
        message?: string;
        reason?: string;
        requiredActions?: unknown[];
      };
    };
    events.push(event);
    if (event.type === "turn.created") {
      if (!event.turnId) throw new Error("TRUEFORGE_TURN_ID_MISSING");
      turnId = event.turnId;
    }
    if (event.type === "thread.done" && event.state?.status === "error")
      throw new Error(
        `TRUEFORGE_THREAD_FAILED: ${event.state.error ?? "unknown"}`,
      );
    if (event.type === "turn.done") {
      if (!event.state) throw new Error("TRUEFORGE_TURN_STATE_MISSING");
      if (event.state.status === "error")
        throw new Error(
          `TRUEFORGE_TURN_FAILED: ${event.state.message ?? "unknown"}`,
        );
      if (event.state.status === "cancelled")
        throw new Error(
          `TRUEFORGE_TURN_CANCELLED: ${event.state.reason ?? "unknown"}`,
        );
      requiredActions = event.state.requiredActions ?? [];
      terminal = true;
    }
  }
  if (!turnId) throw new Error("TRUEFORGE_TURN_ID_MISSING");
  if (!terminal) throw new Error("TRUEFORGE_TURN_TERMINAL_EVENT_MISSING");
  return { turnId, events, requiredActions };
}

export * from "./golden-path";
