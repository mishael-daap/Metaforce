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
Status: pending
Goal: AI tool calling for requirement and action CRUD operations

## 8. Requirement Chat
Status: pending
Goal: Full chat with requirements panel and AI-driven requirement management

## 9. Action Planning
Status: pending
Goal: Expand a requirement into a list of granular, reviewable actions before execution

## 10. Action Execution
Status: pending
Goal: Execute actions sequentially via mocked tool calls with per-action approval and completion tracking

## 11. Error Recovery
Status: pending
Goal: Diagnose failed actions, propose fixes, and retry after user approval

## 12. SFDX Server
Status: pending
Goal: Dockerized Node.js service exposing CLI endpoints for creating Salesforce metadata

## 13. Metadata Library
Status: pending
Goal: Save every created metadata component to Supabase for reuse across orgs and projects

## 14. SFDX Integration
Status: pending
Goal: Replace mocked tool calls with real SFDX Server endpoints for live Salesforce execution

## 15. Chrome Extension
Status: pending
Goal: Extract access token and instance URL from an active Salesforce org session

## 16. Org Connection
Status: pending
Goal: Link a Salesforce org to a Metaforce project using credentials from the Chrome extension