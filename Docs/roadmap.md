# Roadmap

## 1. Data Model

Status: completed
Goal: Define and provision all Supabase tables, relationships, and RLS policies

## 2. Basic Chat Interface

Status: completed
Goal: Basic chat UI with message streaming

## 3. User Authentication

Status: completed
Goal: Set up NextAuth, login/signup pages, protected routes

## 4. Project Management

Status: completed
Goal: Projects page, create project, project selection, database client setup

## 5. Dashboard Page

Status: completed
Goal: Main dashboard with sidebar navigation (Projects, User Profile), default route to /dashboard/projects

## 6. Conversation & Message Persistence

Status: completed
Goal: Persist conversations and messages to Supabase, load chat history when navigating to /chat?projectId=xxx

## 7. Agent Tools for Requirements and Actions

Status: completed
Goal: AI tool calling for requirement and action CRUD operations

## 8. Requirement Chat

Status: completed
Goal: Full chat with requirements panel and AI-driven requirement management

## 9. Execution

Status: completed
Goal: Agent can prepare a set of tasks for a requirement in chat, user approves and agent completes the tasks via mocked tool calls and seek user approval, mark task as complete and repeat for next task

## 10. SFDX Server

Status: completed
Goal: Dockerized Node.js service exposing CLI endpoints for creating Salesforce metadata

## 10.1. Handling Metadata components

Status: pending
Goal: after agent runs tools to create metadata components, save the metadata components to database

## 10.2 Async Job Queue Refactor

Status: in_progress
Goal: Replace sync HTTP tool calls with async job queue for robust, observable metadata operations

### 10.2.1 Database Schema — `jobs` Table

Create `jobs` table with: id, project_id, requirement_id, type, payload, status (pending/in_progress/completed/failed), result, error_message, created_at, updated_at, started_at, completed_at. Add RLS policies and indexes.

### 10.2.2 SFDX Server — Worker Loop

Rewrite SFDX Server from REST API to polling worker. Remove Express routes for create_object, create_field. Add Supabase client, poll `pending` jobs, claim and execute, update status. Keep a lightweight `/health` endpoint.

### 10.2.3 Web App — Job Creation Tools

Replace SFDX tool implementations in `lib/sfdx/objects.ts` and `lib/sfdx/fields.ts`. New tools insert job rows into `jobs` table instead of making HTTP calls.

### 10.2.4 Web App — Job Status Checking

Add `checkJobStatus` tool to the agent. Updated system prompt instructs agent to check for completed jobs on every Build Mode interaction.

### 10.2.5 Web App — Jobs Sidebar UI

Create new `components/jobs/jobs-sidebar.tsx` with Supabase Realtime subscription. Shows job status, progress, and results. Auto-opens when new job is created. Collapsible panel beside the chat.

### 10.2.6 Web App — Context & State Integration

Update chat components, hooks, and layout so that job creation and completion is visible to the user. Ensure Build Mode flow accounts for async jobs (agent checks for completed jobs, waits for user to continue).

### 10.2.7 Cleanup

Remove the now-unnecessary SFDX tool HTTP client (`lib/sfdx/client.ts`), deprecated REST routes on the SFDX server, and old env vars (`SFDX_SERVER_URL`, `SFDX_SERVER_API_KEY`). Update system prompt for Build Mode.

## 11. Metadata Library

Status: pending
Goal: Save every created metadata component to Supabase for reuse across orgs and projects

## 12. SFDX Integration

Status: pending
Goal: Replace mocked tool calls with real SFDX Server endpoints for live Salesforce execution

## 13. Chrome Extension

Status: pending
Goal: Extract access token and instance URL from an active Salesforce org session

## 14. Org Connection

Status: pending
Goal: Link a Salesforce org to a Metaforce project using credentials from the Chrome extension

## 14. Model Selection

Status: pending
Goal: User can add new model with api key and model name, and then select model on chat interface
