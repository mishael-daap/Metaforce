import express from "express";
import { createMcpExpressApp, hostHeaderValidation } from "@modelcontextprotocol/express";
import { NodeStreamableHTTPServerTransport } from "@modelcontextprotocol/node";
import { McpServer, isInitializeRequest } from "@modelcontextprotocol/server";
import * as z from "zod";
import crypto from "crypto";
import { ping } from "./tools/ping.js";

const server = new McpServer({ name: "metaforce-mcp", version: "1.0.0" });

server.registerTool(
  "ping",
  {
    title: "Ping",
    description: "Simple ping tool to verify the MCP server is running",
    inputSchema: z.object({}),
    // Keep your outputSchema as is if it describes the 'structuredData' or 'text'
  },
  async () => {
    const result = await ping(); // Assuming ping() returns { status: "..." }
    
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result)
        }
      ],
      // If you want to keep the structured data for the LLM to parse easily:
      structuredContent: result 
    };
  },
);

async function main() {
  const app = createMcpExpressApp();

  app.use(hostHeaderValidation(["localhost", "127.0.0.1"]));
  app.use(express.json());

  const transports: Record<string, NodeStreamableHTTPServerTransport> = {};

  app.post("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    let transport: NodeStreamableHTTPServerTransport;

    if (sessionId && transports[sessionId]) {
      transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
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

  const port = 8000;
  const httpServer = app.listen(port, "0.0.0.0", () => {
    console.log(`MCP server running on http://0.0.0.0:${port}/mcp`);
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

main();
