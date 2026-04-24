import express from "express";
import { NodeStreamableHTTPServerTransport } from "@modelcontextprotocol/node";
import { McpServer, isInitializeRequest } from "@modelcontextprotocol/server";
import * as z from "zod";
import crypto from "crypto";
import { ping } from "./tools/ping.js";
import { createProject } from "./tools/createProject.js";

const server = new McpServer({ name: "metaforce-mcp", version: "1.0.0" });

server.registerTool(
  "ping",
  {
    title: "Ping",
    description: "Simple ping tool to verify the MCP server is running",
    inputSchema: z.object({}),
  },

  async () => {
    const result = await ping();

    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(result),
        },
      ],
      structuredContent: result,
    };
  },
);

server.registerTool(
  "createProject",
  {
    title: "Create Project",
    description: "Create a new Salesforce DX project with sfdx-project.json and force-app directory structure",
    inputSchema: z.object({
      projectId: z.string().describe("Project folder name (required)"),
      name: z.string().optional().describe("Project name (defaults to projectId)"),
      apiVersion: z.string().optional().describe("Salesforce API version (defaults to 66.0)"),
      namespace: z.string().optional().describe("Package namespace (defaults to empty string)"),
    }),
  },

  async (args) => {
    const result = await createProject({
      projectId: args.projectId,
      name: args.name,
      apiVersion: args.apiVersion,
      namespace: args.namespace,
    });

    if (result.success) {
      const message = `Project '${args.name || args.projectId}' created successfully at ${result.projectPath}`;
      return {
        content: [
          {
            type: "text" as const,
            text: message,
          },
        ],
        structuredContent: result,
      };
    } else {
      return {
        content: [
          {
            type: "text" as const,
            text: `Failed to create project: ${result.error}`,
          },
        ],
        isError: true,
      };
    }
  },
);

async function main() {

  const app = express();

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
