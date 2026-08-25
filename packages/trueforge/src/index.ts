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
    return this.configured().sessions.createTurnStream(sessionId, {
      input: [{ type: "user.message", content: JSON.stringify(input) }],
    });
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

export * from "./golden-path";
