# WorkerOS architecture

The Next.js app is the control-plane surface. TrueForge owns supervisor sessions, event streaming, specialist delegation, and approval gates. Google ADK specialists run as typed services on Vertex AI. The TypeScript MCP service is the only enterprise-data tool boundary and reads/writes PostgreSQL through Drizzle in the next implementation slice. `packages/contracts` is the shared schema boundary; `packages/policy` is the deny-by-default tool policy boundary.

No sensitive write is executed by the web app. If TrueForge is not configured, the adapter returns `TRUEFORGE_UNAVAILABLE`. Demo data is synthetic.
