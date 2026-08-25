import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createEnterpriseMcpServer } from "./server";

const port = Number(process.env.MCP_PORT ?? 4000);
const sessions = new Map<
  string,
  {
    transport: StreamableHTTPServerTransport;
    mcp: ReturnType<typeof createEnterpriseMcpServer>;
  }
>();
const httpServer = createServer(async (request, response) => {
  if (request.url !== "/mcp" || request.method !== "POST") {
    response.writeHead(404).end();
    return;
  }
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  try {
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8")) as {
      method?: string;
    };
    const header = request.headers["mcp-session-id"];
    const sessionId = Array.isArray(header) ? header[0] : header;
    let session = sessionId ? sessions.get(sessionId) : undefined;
    if (!session && body.method !== "initialize") {
      response
        .writeHead(400, { "content-type": "application/json" })
        .end(JSON.stringify({ error: "MCP_SESSION_REQUIRED" }));
      return;
    }
    if (!session) {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: randomUUID,
      });
      const mcp = createEnterpriseMcpServer();
      session = { transport, mcp };
      transport.onclose = () => {
        if (transport.sessionId) sessions.delete(transport.sessionId);
        void mcp.close();
      };
      await mcp.connect(transport);
    }
    await session.transport.handleRequest(request, response, body);
    if (session.transport.sessionId)
      sessions.set(session.transport.sessionId, session);
  } catch (error) {
    if (!response.headersSent)
      response.writeHead(500, { "content-type": "application/json" }).end(
        JSON.stringify({
          error: error instanceof Error ? error.message : "MCP_REQUEST_FAILED",
        }),
      );
  }
});
httpServer.listen(port, () =>
  console.log(`WorkerOS Enterprise MCP listening on :${port}/mcp`),
);
