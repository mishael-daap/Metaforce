// import { setupProject } from "./utils/setupProject.js";

// async function main() {
//   const result = await setupProject({
//     alias: "metaforce-registered",
//     instanceUrl: "https://orgfarm-cf567c8e83-dev-ed.develop.my.salesforce.com",
//     accessToken: "00DgK00000FEwjR!AQEAQFgchO3rozrWn5lxOyMJoOqn2qJMvsk7etljxKeD4EG_8_6caQBmi3.OT1YmnzWLFTTANVv.9.24Uud.tCsfnoJ0s_ZN"
//   });

//   if (result.success) {
//     console.log(`Project setup successful at: ${result.projectPath}`);
//   } else {
//     console.error(`Project setup failed: ${result.error}`);
//     process.exit(1);
//   }
// }

// main();


import express from "express";
import { NodeStreamableHTTPServerTransport } from "@modelcontextprotocol/node";
import { McpServer, isInitializeRequest } from "@modelcontextprotocol/server";
import * as z from "zod";
import crypto from "crypto";
import { ping } from "./tools/ping.js";
import { createCustomObject } from "./tools/createCustomObject.js";
import { createCustomField } from "./tools/createCustomField.js";
import { deployMetadata } from "./tools/deployMetadata.js";
import { setupProject } from "./utils/setupProject.js";

// --- Types ---

interface SessionContext {
  projectId: string;
  targetOrg: string;
}

interface Session {
  transport: NodeStreamableHTTPServerTransport;
  context: SessionContext;
}

// --- Server Factory ---

function createServer(context: SessionContext): McpServer {
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
        content: [{ type: "text" as const, text: JSON.stringify(result) }],
        structuredContent: result,
      };
    },
  );

  server.registerTool(
    "createObject",
    {
      title: "Create Object",
      description: "Create a new Salesforce custom object with its metadata XML file",
      inputSchema: z.object({
        fullName: z.string().describe("Object API name (must end with __c, e.g., 'MyObject__c')"),
        label: z.string().describe("Singular label (e.g., 'My Object')"),
        pluralLabel: z.string().describe("Plural label (e.g., 'My Objects')"),
        description: z.string().optional().describe("Object description"),
        deploymentStatus: z.enum(["Deployed", "InDevelopment"]).describe("Deployment status"),
        sharingModel: z.enum(["ReadWrite", "Private", "ControlledByParent"]).describe("Sharing model"),
        visibility: z.enum(["Public", "PackageProtected"]).describe("Visibility setting"),
        nameField: z.object({
          label: z.string().describe("Name field label"),
          type: z.enum(["Text", "AutoNumber"]).describe("Name field type"),
          displayFormat: z.string().optional().describe("Display format for AutoNumber (e.g., 'MO-{0000}')"),
          scale: z.number().optional().describe("Scale for AutoNumber"),
          trackHistory: z.boolean().optional().describe("Track field history"),
        }).describe("Name field configuration"),
      }),
    },
    async (args) => {
      const result = await createCustomObject(context.projectId, {
        fullName: args.fullName,
        label: args.label,
        pluralLabel: args.pluralLabel,
        description: args.description,
        deploymentStatus: args.deploymentStatus,
        sharingModel: args.sharingModel,
        visibility: args.visibility,
        nameField: args.nameField,
      });

      if (result.success) {
        return {
          content: [{ type: "text" as const, text: `Custom object '${args.label}' (${args.fullName}) created successfully at ${result.outputPath}` }],
          structuredContent: result,
        };
      } else {
        return {
          content: [{ type: "text" as const, text: `Failed to create object: ${result.error}` }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "createField",
    {
      title: "Create Field",
      description: "Add a custom field to an existing Salesforce object",
      inputSchema: z.object({
        objectName: z.string().describe("Object API name (must end with __c)"),
        fullName: z.string().describe("Field API name (must end with __c, e.g., 'MyField__c')"),
        label: z.string().describe("Field label"),
        type: z.enum([
          "Text", "TextArea", "LongTextArea", "Html", "EncryptedText",
          "Number", "Currency", "Percent", "Location", "Checkbox",
          "Date", "DateTime", "Time", "Email", "Phone", "Url",
          "AutoNumber", "Lookup", "MasterDetail", "Picklist", "MultiselectPicklist",
          "Formula", "Summary"
        ]).describe("Field type"),
        description: z.string().optional().describe("Field description"),
        required: z.boolean().optional().describe("Whether field is required"),
        defaultValue: z.string().optional().describe("Default value"),
        helpText: z.string().optional().describe("Help text"),
        trackHistory: z.boolean().optional().describe("Track field history"),
        trackFeedHistory: z.boolean().optional().describe("Track feed history"),
        unique: z.boolean().optional().describe("Enforce unique values"),
        caseSensitive: z.boolean().optional().describe("Case sensitive (for text fields)"),
        length: z.number().optional().describe("Max length (for text fields)"),
        visibleLines: z.number().optional().describe("Visible lines (for textarea fields)"),
        maskChar: z.string().optional().describe("Mask character (for EncryptedText)"),
        maskType: z.string().optional().describe("Mask type (for EncryptedText)"),
        precision: z.number().optional().describe("Precision (for Number/Currency/Percent)"),
        scale: z.number().optional().describe("Scale (for Number/Currency/Percent)"),
        displayFormat: z.string().optional().describe("Display format (for AutoNumber)"),
        referenceTo: z.string().optional().describe("Reference object (for Lookup/MasterDetail)"),
        relationshipName: z.string().optional().describe("Relationship name (for Lookup/MasterDetail)"),
        relationshipLabel: z.string().optional().describe("Relationship label (for Lookup/MasterDetail)"),
        relationshipOrder: z.string().optional().describe("Relationship order (for MasterDetail)"),
        formula: z.string().optional().describe("Formula expression (for Formula fields)"),
        summaryForeignKey: z.string().optional().describe("Summary foreign key (for Summary fields)"),
        summaryOperation: z.string().optional().describe("Summary operation (for Summary fields)"),
        summarizedField: z.string().optional().describe("Summarized field (for Summary fields)"),
      }),
    },
    async (args) => {
      const spec: any = {
        fullName: args.fullName,
        label: args.label,
        type: args.type,
      };

      if (args.description !== undefined) spec.description = args.description;
      if (args.required !== undefined) spec.required = args.required;
      if (args.defaultValue !== undefined) spec.defaultValue = args.defaultValue;
      if (args.helpText !== undefined) spec.helpText = args.helpText;
      if (args.trackHistory !== undefined) spec.trackHistory = args.trackHistory;
      if (args.trackFeedHistory !== undefined) spec.trackFeedHistory = args.trackFeedHistory;
      if (args.unique !== undefined) spec.unique = args.unique;
      if (args.caseSensitive !== undefined) spec.caseSensitive = args.caseSensitive;
      if (args.length !== undefined) spec.length = args.length;
      if (args.visibleLines !== undefined) spec.visibleLines = args.visibleLines;
      if (args.maskChar !== undefined) spec.maskChar = args.maskChar;
      if (args.maskType !== undefined) spec.maskType = args.maskType;
      if (args.precision !== undefined) spec.precision = args.precision;
      if (args.scale !== undefined) spec.scale = args.scale;
      if (args.displayFormat !== undefined) spec.displayFormat = args.displayFormat;
      if (args.referenceTo !== undefined) spec.referenceTo = args.referenceTo;
      if (args.relationshipName !== undefined) spec.relationshipName = args.relationshipName;
      if (args.relationshipLabel !== undefined) spec.relationshipLabel = args.relationshipLabel;
      if (args.relationshipOrder !== undefined) spec.relationshipOrder = args.relationshipOrder;
      if (args.formula !== undefined) spec.formula = args.formula;
      if (args.summaryForeignKey !== undefined) spec.summaryForeignKey = args.summaryForeignKey;
      if (args.summaryOperation !== undefined) spec.summaryOperation = args.summaryOperation;
      if (args.summarizedField !== undefined) spec.summarizedField = args.summarizedField;

      const result = await createCustomField(context.projectId, args.objectName, spec);

      if (result.success) {
        return {
          content: [{ type: "text" as const, text: `Custom field '${args.label}' (${args.fullName}) created successfully on '${args.objectName}' at ${result.outputPath}` }],
          structuredContent: result,
        };
      } else {
        return {
          content: [{ type: "text" as const, text: `Failed to create field: ${result.error}` }],
          isError: true,
        };
      }
    },
  );

  server.registerTool(
    "deploy",
    {
      title: "Deploy Metadata",
      description: "Deploy metadata from force-app directory to the authenticated Salesforce org",
      inputSchema: z.object({
        dryRun: z.boolean().optional().describe("Run a dry run to validate without deploying"),
      }),
    },
    async (args) => {
      const result = await deployMetadata({
        projectId: context.projectId,
        targetOrg: context.targetOrg,
        dryRun: args.dryRun,
      });

      if (result.success) {
        let message = `Deployment successful! ${result.componentSuccesses} components deployed.`;
        if (result.deploymentId) message += ` Deployment ID: ${result.deploymentId}`;
        return {
          content: [{ type: "text" as const, text: message }],
          structuredContent: result,
        };
      } else {
        return {
          content: [{ type: "text" as const, text: `Deployment failed: ${result.error}. ${result.componentFailures} components failed.` }],
          isError: true,
        };
      }
    },
  );

  return server;
}

// --- Main ---

async function main() {
  const app = express();
  app.use(express.json());

  const sessions: Record<string, Session> = {};

  app.post("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    let session: Session;

    if (sessionId && sessions[sessionId]) {
      session = sessions[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      // Extract setup headers
      const alias = req.headers["x-alias"] as string;
      const instanceUrl = req.headers["x-instance-url"] as string;
      const accessToken = req.headers["x-access-token"] as string;

      console.log(alias, instanceUrl, accessToken)

      // Validate required headers
      if (!alias || !instanceUrl || !accessToken) {
        res.status(400).json({
          jsonrpc: "2.0",
          error: { code: -32000, message: "Missing required headers: x-alias, x-instance-url, x-access-token" },
          id: null,
        });
        return;
      }

      // Setup project and authenticate org
      const setupResult = await setupProject({ alias, instanceUrl, accessToken });

      if (!setupResult.success) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32000, message: `Project setup failed: ${setupResult.error}` },
          id: null,
        });
        return;
      }

      // Create session context
      const context: SessionContext = {
        projectId: alias,
        targetOrg: alias,
      };
      const server = createServer(context);

      const transport = new NodeStreamableHTTPServerTransport({
        sessionIdGenerator: () => crypto.randomUUID(),
        onsessioninitialized: (id) => {
          sessions[id] = { transport, context };
        },
      });

      transport.onclose = () => {
        if (transport.sessionId) {
          delete sessions[transport.sessionId];
        }
      };

      await server.connect(transport);
      session = { transport, context };
    } else {
      res.status(400).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Bad request" },
        id: null,
      });
      return;
    }

    await session.transport.handleRequest(req, res, req.body);
  });

  app.get("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !sessions[sessionId]) {
      res.status(404).send("Session not found");
      return;
    }
    await sessions[sessionId].transport.handleRequest(req, res);
  });

  app.delete("/mcp", async (req, res) => {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    if (!sessionId || !sessions[sessionId]) {
      res.status(404).send("Session not found");
      return;
    }
    await sessions[sessionId].transport.handleRequest(req, res);
  });

  const port = 8000;
  const httpServer = app.listen(port, "0.0.0.0", () => {
    console.log(`MCP server running on http://0.0.0.0:${port}/mcp`);
  });

  process.stdin.resume();

  const shutdown = async () => {
    console.log("\nShutting down server...");
    for (const [id, s] of Object.entries(sessions)) {
      await s.transport.close();
      delete sessions[id];
    }
    httpServer.close(() => process.exit(0));
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main();
