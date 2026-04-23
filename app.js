async function main() {
  const BASE_URL = "https://metaforce-x9ma.onrender.com/mcp";

  const initRes = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Host": "metaforce-x9ma.onrender.com",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "my-client", version: "1.0.0" },
      },
      id: 1,
    }),
  });

  const sessionId = initRes.headers.get("mcp-session-id");
  const initData = await initRes.json();
  console.log("Initialized:", JSON.stringify(initData, null, 2));
  console.log("Session ID:", sessionId);
}

main().catch(console.error);