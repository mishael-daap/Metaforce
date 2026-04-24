import express from "express";
import { NodeStreamableHTTPServerTransport } from "@modelcontextprotocol/node";
import { McpServer, isInitializeRequest } from "@modelcontextprotocol/server";
import * as z from "zod";
import crypto from "crypto";
import { ping } from "./tools/ping.js";
import { createProject } from "./tools/createProject.js";
import { createCustomObject } from "./tools/createCustomObject.js";
import { createCustomField } from "./tools/createCustomField.js";
import { deployMetadata } from "./tools/deployMetadata.js";
const server = new McpServer({ name: "metaforce-mcp", version: "1.0.0" });
server.registerTool("ping", {
    title: "Ping",
    description: "Simple ping tool to verify the MCP server is running",
    inputSchema: z.object({}),
}, async () => {
    const result = await ping();
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(result),
            },
        ],
        structuredContent: result,
    };
});
server.registerTool("createProject", {
    title: "Create Project",
    description: "Create a new Salesforce DX project with sfdx-project.json and force-app directory structure",
    inputSchema: z.object({
        projectId: z.string().describe("Project folder name (required)"),
        name: z.string().optional().describe("Project name (defaults to projectId)"),
        apiVersion: z.string().optional().describe("Salesforce API version (defaults to 66.0)"),
        namespace: z.string().optional().describe("Package namespace (defaults to empty string)"),
    }),
}, async (args) => {
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
                    type: "text",
                    text: message,
                },
            ],
            structuredContent: result,
        };
    }
    else {
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to create project: ${result.error}`,
                },
            ],
            isError: true,
        };
    }
});
server.registerTool("createObject", {
    title: "Create Object",
    description: "Create a new Salesforce custom object with its metadata XML file",
    inputSchema: z.object({
        projectId: z.string().describe("Project folder name (required)"),
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
}, async (args) => {
    const result = await createCustomObject(args.projectId, {
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
        const objectName = args.fullName;
        return {
            content: [
                {
                    type: "text",
                    text: `Custom object '${args.label}' (${objectName}) created successfully at ${result.outputPath}`,
                },
            ],
            structuredContent: result,
        };
    }
    else {
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to create object: ${result.error}`,
                },
            ],
            isError: true,
        };
    }
});
server.registerTool("createField", {
    title: "Create Field",
    description: "Add a custom field to an existing Salesforce object",
    inputSchema: z.object({
        projectId: z.string().describe("Project folder name (required)"),
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
}, async (args) => {
    // Build spec object based on field type
    const spec = {
        fullName: args.fullName,
        label: args.label,
        type: args.type,
    };
    // Add optional fields if provided
    if (args.description !== undefined)
        spec.description = args.description;
    if (args.required !== undefined)
        spec.required = args.required;
    if (args.defaultValue !== undefined)
        spec.defaultValue = args.defaultValue;
    if (args.helpText !== undefined)
        spec.helpText = args.helpText;
    if (args.trackHistory !== undefined)
        spec.trackHistory = args.trackHistory;
    if (args.trackFeedHistory !== undefined)
        spec.trackFeedHistory = args.trackFeedHistory;
    if (args.unique !== undefined)
        spec.unique = args.unique;
    if (args.caseSensitive !== undefined)
        spec.caseSensitive = args.caseSensitive;
    if (args.length !== undefined)
        spec.length = args.length;
    if (args.visibleLines !== undefined)
        spec.visibleLines = args.visibleLines;
    if (args.maskChar !== undefined)
        spec.maskChar = args.maskChar;
    if (args.maskType !== undefined)
        spec.maskType = args.maskType;
    if (args.precision !== undefined)
        spec.precision = args.precision;
    if (args.scale !== undefined)
        spec.scale = args.scale;
    if (args.displayFormat !== undefined)
        spec.displayFormat = args.displayFormat;
    if (args.referenceTo !== undefined)
        spec.referenceTo = args.referenceTo;
    if (args.relationshipName !== undefined)
        spec.relationshipName = args.relationshipName;
    if (args.relationshipLabel !== undefined)
        spec.relationshipLabel = args.relationshipLabel;
    if (args.relationshipOrder !== undefined)
        spec.relationshipOrder = args.relationshipOrder;
    if (args.formula !== undefined)
        spec.formula = args.formula;
    if (args.summaryForeignKey !== undefined)
        spec.summaryForeignKey = args.summaryForeignKey;
    if (args.summaryOperation !== undefined)
        spec.summaryOperation = args.summaryOperation;
    if (args.summarizedField !== undefined)
        spec.summarizedField = args.summarizedField;
    const result = await createCustomField(args.projectId, args.objectName, spec);
    if (result.success) {
        const fieldName = args.fullName;
        return {
            content: [
                {
                    type: "text",
                    text: `Custom field '${args.label}' (${fieldName}) created successfully on object '${args.objectName}' at ${result.outputPath}`,
                },
            ],
            structuredContent: result,
        };
    }
    else {
        return {
            content: [
                {
                    type: "text",
                    text: `Failed to create field: ${result.error}`,
                },
            ],
            isError: true,
        };
    }
});
server.registerTool("deploy", {
    title: "Deploy Metadata",
    description: "Deploy metadata from force-app directory to a Salesforce org using Salesforce CLI",
    inputSchema: z.object({
        projectId: z.string().describe("Project folder name (required)"),
        targetOrg: z.string().describe("Target org username/alias (must be authenticated)"),
        dryRun: z.boolean().optional().describe("Run a dry run to validate without deploying"),
    }),
}, async (args) => {
    const result = await deployMetadata({
        projectId: args.projectId,
        targetOrg: args.targetOrg,
        dryRun: args.dryRun,
    });
    if (result.success) {
        let message = `Deployment successful! ${result.componentSuccesses} components deployed.`;
        if (result.deploymentId) {
            message += ` Deployment ID: ${result.deploymentId}`;
        }
        return {
            content: [
                {
                    type: "text",
                    text: message,
                },
            ],
            structuredContent: result,
        };
    }
    else {
        return {
            content: [
                {
                    type: "text",
                    text: `Deployment failed: ${result.error}. ${result.componentFailures} components failed.`,
                },
            ],
            isError: true,
        };
    }
});
async function main() {
    const app = express();
    app.use(express.json());
    const transports = {};
    app.post("/mcp", async (req, res) => {
        const sessionId = req.headers["mcp-session-id"];
        let transport;
        if (sessionId && transports[sessionId]) {
            transport = transports[sessionId];
        }
        else if (!sessionId && isInitializeRequest(req.body)) {
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
        }
        else {
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
        const sessionId = req.headers["mcp-session-id"];
        if (!sessionId || !transports[sessionId]) {
            res.status(404).send("Session not found");
            return;
        }
        await transports[sessionId].handleRequest(req, res);
    });
    app.delete("/mcp", async (req, res) => {
        const sessionId = req.headers["mcp-session-id"];
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
//# sourceMappingURL=index.js.map