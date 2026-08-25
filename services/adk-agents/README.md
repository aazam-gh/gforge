# Google ADK specialists

Google ADK specialists running on Vertex AI. Each specialist exposes a typed `analyze(input) -> result` interface and `/health`. Create the local virtual environment with Python 3.12 or later and install the project before running `pnpm adk:dev`; the root command uses that local environment rather than a global `uvicorn` installation. Configure `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION=global`, and `GOOGLE_GENAI_USE_VERTEXAI=true` for the live Contract Agent.
