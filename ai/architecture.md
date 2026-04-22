# Architecture

## System Stack
- Frontend: Vercel AI SDK in Nextjs
- Backend: MCP (Model Context Protocol) Server
- Database: Supbase
- Integration: Salesforce CLI

## Tech stack 
- Styling: Tailwind css with reusable styles in app.css
- UI Components: Shadcn UI

## System Structure
- Vercel AI SDK Frontend: Orchestrates the LLM agent, processes user input, and manages the UI state for approvals and verification.
- MCP Server: Encapsulates specific Salesforce operations (e.g., create object, create field) into callable tools.

## Data Flow
User Input → Vercel AI SDK Agent → Execution Plan UI (Approval) → MCP Server → Salesforce CLI → Response/Self-Correction loop → UI Verification Pause

## Execution Loop
1. Analyze & Sequence: Agent ingests requirements and maps dependencies.
2. Plan: Converts requirements into a checklist of MCP tool actions.
3. Approve: Pauses and presents the execution plan for user sign-off.
4. Execute & Self-Correct: Runs actions for a single requirement; autonomously handles and retries tool errors.
5. Verify: Pauses for user to manually verify that the requirement has been implemented in Salesforce before proceeding to the next requirement.

## Core Entities
- Requirement: A discrete business need that the agent sequences and breaks down into technical actions.
- Action (Tool Call): An atomic operation executed by the MCP server against the Salesforce API, such as creating a field or deploying metadata.
- Org: The specific target Salesforce environment where the system deploys and the user verifies the metadata.
- Project: The overarching container that groups a sequence of requirements and maps them to a specific target Org.
- User: The human operator who inputs requirements, approves execution plans, and manually verifies the live changes.

## Key Decisions
- Agent Orchestration: Vercel AI SDK handles the LLM planning and tool calling loops.
- Tool Encapsulation: MCP Server isolates Salesforce complexity.
- Execution Pattern: Sequential, blocking workflow (Plan -> Approve -> Execute/Self-Correct -> Verify -> Next).
- Salesforce CLI will be installed in the Docker container.

## Constraints
- Restricted Scope: Only custom objects and custom fields are supported for now (no tabs, flows, Apex, etc.).
- Must use MCP for tool definitions.
- Must run the MCP server inside Docker.
- Avoid autonomous progression without explicit user verification.
- Use `/ai/context/example-tools/` as the reference for building MCP tool logic.

## Development Architecture
- Package Manager: pnpm (using workspaces)
- Containerization: Docker (isolating the MCP Server)
- Project Structure: 
  - `/frontend`: Vercel AI SDK application
  - `/mcp-server`: Dockerized Salesforce MCP backend
  - `/ai/context/example-tools/`: Contains validated reference functions for Salesforce operations (objects, fields, deployments). Must be used as the source of truth for MCP tools.
  - `/ai/context/example-org/`: Reference active SFDX org.