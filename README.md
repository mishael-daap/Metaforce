# Metaforce

An AI-powered agent system that translates natural language requirements directly into Salesforce metadata deployments, accelerating delivery by 1000x.

## Overview

Metaforce bridges the gap between business requirements and Salesforce implementation by automating the configuration process. Instead of manual setup taking weeks, describe what you need in plain language and let the AI agent handle the rest.

## Target Users

- Salesforce Developers
- Salesforce Consultants
- Salesforce Architects
- Non-technical Stakeholders

## Core Features

- **Automated Requirement Sequencing** - Ingests requirements and maps dependencies automatically
- **Step-by-Step Action Plans** - Converts requirements into discrete Salesforce operations
- **Human-in-the-Loop Approval** - Explicit checkpoints for user verification before deployment
- **Autonomous Error Handling** - Self-correction during tool execution with retry logic

## Architecture

### System Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vercel AI SDK + Next.js |
| Backend | MCP (Model Context Protocol) Server |
| Database | Supabase |
| Integration | Salesforce CLI |
| Styling | Tailwind CSS |
| UI Components | Shadcn UI |

### System Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│                    (Next.js + Vercel AI SDK)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      LLM Agent Orchestration                    │
│              (Planning, Tool Calling, State Management)         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MCP Server (Docker)                        │
│         (Salesforce Operations: Create Object, Field, etc.)     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Salesforce CLI                             │
│                    (Metadata Deployment)                        │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Input → Vercel AI SDK Agent → Execution Plan UI (Approval) 
    → MCP Server → Salesforce CLI → Response/Self-Correction 
    → UI Verification Pause → Next Requirement
```

### Execution Loop

1. **Analyze & Sequence** - Agent ingests requirements and maps dependencies
2. **Plan** - Converts requirements into a checklist of MCP tool actions
3. **Approve** - Pauses for user sign-off on the execution plan
4. **Execute & Self-Correct** - Runs actions for a single requirement; handles errors autonomously
5. **Verify** - Pauses for manual user verification in Salesforce org before proceeding

## Core Entities

| Entity | Description |
|--------|-------------|
| **Requirement** | A discrete business need that the agent sequences and breaks down into technical actions |
| **Action** | An atomic operation (tool call) executed by the MCP server against Salesforce API |
| **Org** | The target Salesforce environment for deployment and verification |
| **Project** | Container that groups requirements and maps them to a specific Org |
| **User** | Human operator who inputs requirements, approves plans, and verifies changes |

## Project Structure

```
metaforce/
├── web/                    # Vercel AI SDK + Next.js frontend
│   ├── src/
│   │   ├── app/           # Next.js app router pages
│   │   ├── components/    # Reusable UI components (Shadcn)
│   │   └── lib/           # Utility functions and helpers
│   ├── package.json
│   └── .env.local
├── mcp-server/            # Dockerized Salesforce MCP backend
│   ├── src/
│   │   ├── index.ts       # Server entry point
│   │   └── tools/         # Salesforce tool implementations
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── package.json
├── ai/                    # AI context and documentation
│   ├── overview.md        # Product overview
│   ├── architecture.md    # System architecture
│   ├── roadmap.md         # Feature roadmap
│   ├── instructions.md    # Development guidelines
│   ├── context/           # Reference implementations
│   │   ├── reference-tools/
│   │   └── reference-org/
│   └── dependencies/      # Library documentation
├── package.json           # Root workspace config
└── pnpm-workspace.yaml    # pnpm workspace definition
```

## Constraints

### Product Constraints

- Must enforce explicit user approval before executing any deployment action
- Must halt and wait for manual user verification in Salesforce org before proceeding
- Restricted scope: Only custom objects and custom fields supported (no tabs, flows, Apex)

### Technical Constraints

- Must use MCP for tool definitions
- MCP server must run inside Docker
- Avoid autonomous progression without explicit user verification
- Use `/ai/context/reference-tools/` as the reference for building MCP tool logic

## Development

### Prerequisites

- Node.js (v20+)
- pnpm (v9+)
- Docker (for MCP server)
- Salesforce CLI (inside Docker container)

### Installation

```bash
# Install dependencies
pnpm install

# Install dependencies for individual packages
pnpm -r install
```

### Development

```bash
# Run all services in development mode
pnpm dev

# Run specific package
pnpm --filter web dev
pnpm --filter mcp-server dev
```

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter web build
pnpm --filter mcp-server build
```

### Running the MCP Server

```bash
# Using Docker Compose
cd mcp-server
docker-compose up --build
```

## Key Design Decisions

- **Agent Orchestration**: Vercel AI SDK handles LLM planning and tool calling loops
- **Tool Encapsulation**: MCP Server isolates Salesforce complexity
- **Execution Pattern**: Sequential, blocking workflow (Plan → Approve → Execute/Self-Correct → Verify → Next)
- **Containerization**: Salesforce CLI runs inside Docker for isolation and reproducibility

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run all packages in development mode |
| `pnpm build` | Build all packages |
| `pnpm lint` | Run linting across all packages |

## Technologies

- **Frontend**: Next.js 16, React 19, Vercel AI SDK
- **AI Providers**: Google, Groq, Zhipu AI
- **UI**: Tailwind CSS 4, Shadcn UI, Lucide Icons
- **Backend**: MCP Server (Express-based)
- **Package Manager**: pnpm workspaces
- **Containerization**: Docker

## Contributing

1. Read `ai/instructions.md` for development guidelines
2. Check `ai/roadmap.md` for current priorities
3. Review `ai/architecture.md` for system design
4. Follow the feature development workflow:
   - Design discussion (chat only)
   - Spec generation
   - User approval
   - File creation
   - Task execution (one at a time)
   - User validation

## License

Private - All rights reserved
