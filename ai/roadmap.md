# Roadmap

## 1. Frontend & Agent Setup
Status: completed
Goal: Initialize the Vercel AI SDK project and basic chat interface with model.

## 2. MCP Server Foundation
Status: pending
Goal: Set up the MCP server and connect it to the agent.

## 3. Create Project Tool
Status: pending
Goal: Build and connect the MCP tool to set up the Salesforce DX environment.

## 4. Create Object Tool
Status: pending
Goal: Build and connect the MCP tool to generate custom object metadata alongside its fields.

## 5. Create Field Tool
Status: pending
Goal: Build and connect the MCP tool to append new custom fields to existing objects.

## 6. Deploy Tool
Status: pending
Goal: Build and connect the MCP tool to deploy the generated metadata to the Salesforce org using the CLI.

## 7. Planning & Sequencing Logic
Status: pending
Goal: Implement the agent's ability to ingest requirements, sequence them, and map them to the specific MCP tools (Project, Object, Field, Deploy).

## 8. Execution & Self-Correction Engine
Status: pending
Goal: Implement the agent loop to iterate through the planned actions, execute them via MCP tool calls, autonomously catch and resolve Salesforce CLI errors, and continuously update the status of each action as it progresses.

## 9. Interactive UI & Human-in-the-Loop
Status: pending
Goal: Build the frontend interface to display the ingested requirements and planned actions, featuring state management and approval buttons to pause for human verification before execution and post-deployment.