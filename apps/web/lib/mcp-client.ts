export async function closeMcpClient(client: { close: () => Promise<void> }) {
  try {
    await client.close();
  } catch (error) {
    // The SDK aborts its Streamable HTTP receive loop during a normal close.
    // That transport-level AbortError must not turn a completed tool call into
    // a failed investigation, but every other close failure remains visible.
    if (error instanceof DOMException && error.name === "AbortError") return;
    throw error;
  }
}
