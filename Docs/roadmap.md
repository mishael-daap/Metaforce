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
Status: in-progress
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