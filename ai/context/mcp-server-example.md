import express from "express";
import { createMcpExpressApp, hostHeaderValidation } from "@modelcontextprotocol/express";
import { NodeStreamableHTTPServerTransport } from "@modelcontextprotocol/node";
import { McpServer, isInitializeRequest } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { createFile } from "./tools/create-file.js";
import crypto from "crypto";
 

const server = new McpServer({ name: "my-server", version: "1.0.0" });

server.registerResource(
  "instructions",
  "agent://instructions",
  {
    description: "These are the instructions",
    title: "Instructions",
    mimeType: "application/json",
  },
  async (uri) => {
    const data = await import("./instructions.json", {
      with: { type: "json" },
    }).then((m) => m.default);

    return {
      contents: [{ uri: uri.href, text: JSON.stringify(data), mimeType: "application/json" }],
    };
  },
);

server.registerTool(
  "create-file",
  {
    title: "File Creator",
    description: "creates a file and puts text in it",
    inputSchema: z.object({
      filePath: z.string(),
      content: z.string(),
    }),
  },
  async ({ filePath, content }) => {
    createFile(filePath, content);
    return {
      content: [{ type: "text", text: "file created" }],
      structuredContent: { text: "file created" },
    };
  },
);

server.registerTool(
  "calculate-bmi",
  {
    title: "BMI Calculator",
    description: "Calculate Body Mass Index",
    inputSchema: z.object({
      weightKg: z.number(),
      heightM: z.number(),
    }),
    outputSchema: z.object({ bmi: z.number() }),
  },
  async ({ weightKg, heightM }) => {
    const output = { bmi: weightKg / (heightM * heightM) };
    return {
      content: [{ type: "text", text: JSON.stringify(output) }],
      structuredContent: output,
    };
  },
);

async function main() {
  const app = createMcpExpressApp();

  app.use(hostHeaderValidation(["localhost", "127.0.0.1"]));
  app.use(express.json());

  // Session map - same pattern as the reference code
  const transports: Record<string, NodeStreamableHTTPServerTransport> = {};

  app.post("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    let transport: NodeStreamableHTTPServerTransport;

    if (sessionId && transports[sessionId]) {
      // Reuse existing session transport
      transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      // New session - create a fresh transport
      transport = new NodeStreamableHTTPServerTransport({
        sessionIdGenerator: () => crypto.randomUUID(),
        onsessioninitialized: (id) => {
          transports[id] = transport;
        },
      });

      transport.onclose = () => {
        if (transport.sessionId) {
          delete transports[transport.sessionId];
        }
      };

      // Connect BEFORE handling the request
      await server.connect(transport);
    } else {
      res.status(400).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Bad request" },
        id: null,
      });
      return;
    }

    await transport.handleRequest(req, res, req.body);
  });

  app.get("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
      res.status(404).send("Session not found");
      return;
    }
    await transports[sessionId].handleRequest(req, res);
  });

  app.delete("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !transports[sessionId]) {
      res.status(404).send("Session not found");
      return;
    }
    await transports[sessionId].handleRequest(req, res);
  });

  const port = Number(process.env.PORT) || 3000;
  const httpServer = app.listen(port, "127.0.0.1", () => {
    console.log(`MCP server running on http://127.0.0.1:${port}/mcp`);
  });

  process.stdin.resume();

  const shutdown = async () => {
    console.log("\nShutting down server...");
    for (const [id, t] of Object.entries(transports)) {
      await t.close();
      delete transports[id];
    }
    httpServer.close(() => process.exit(0));
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main()

//   const app = createMcpExpressApp();

//   // Enable host header validation for DNS rebinding protection
//   app.use(hostHeaderValidation(["localhost", "127.0.0.1"]));

//   // Create a single transport instance for stateful session management
//   const transport = new NodeStreamableHTTPServerTransport({
//     sessionIdGenerator: () => crypto.randomUUID(),
//   });
//   await server.connect(transport);

//   // POST endpoint for client -> server messages
//   app.post("/mcp", async (req, res) => {
//     await transport.handleRequest(req, res, req.body);
//   });

//   // GET endpoint for server -> client SSE stream
//   app.get("/mcp", async (req, res) => {
//     await transport.handleRequest(req, res);
//   });

//   // DELETE endpoint for session termination
//   app.delete("/mcp", async (req, res) => {
//     await transport.handleRequest(req, res);
//   });

//   const port = Number(process.env.PORT) || 3000;
  
//   const httpServer = app.listen(port, "127.0.0.1", () => {
//     console.log(`MCP server running on http://127.0.0.1:${port}/mcp`);
//   });

//   // FIX: Force the Node event loop to stay awake.
//   // Prevents the alpha transport SDKs from accidentally dropping the process.
//   process.stdin.resume();

//   // FIX: Add graceful shutdown handlers so Ctrl+C closes the port properly
//   const shutdown = () => {
//     console.log("\nShutting down server...");
//     httpServer.close(() => process.exit(0));
//   };
//   process.on("SIGINT", shutdown);
//   process.on("SIGTERM", shutdown);
// }

// main().catch(console.error);