import { createServer } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createEnterpriseMcpServer } from "./server";

const port = Number(process.env.MCP_PORT ?? 4000);
const httpServer = createServer(async (request, response) => {
  if (request.url !== "/mcp" || request.method !== "POST") {
    response.writeHead(404).end();
    return;
  }
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.from(chunk));
  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    const mcp = createEnterpriseMcpServer();
    await mcp.connect(transport);
    await transport.handleRequest(
      request,
      response,
      JSON.parse(Buffer.concat(chunks).toString("utf8")),
    );
    response.once("close", () => {
      void transport.close();
      void mcp.close();
    });
  } catch (error) {
    if (!response.headersSent)
      response
        .writeHead(500, { "content-type": "application/json" })
        .end(
          JSON.stringify({
            error:
              error instanceof Error ? error.message : "MCP_REQUEST_FAILED",
          }),
        );
  }
});
httpServer.listen(port, () =>
  console.log(`WorkerOS Enterprise MCP listening on :${port}/mcp`),
);
