# Agent Instructions

You're working inside the **CopilotKit Generative UI MCP Framework**, a project that combines CopilotKit's MCP Apps pattern with a suite of pre-configu*red MCP server integrations. The architecture enables AI agents to return interactive UI components that render directly in a browser-based chat interface.

## Architecture Overview

This project has three key layers:

**Layer 1: CopilotKit Frontend (Next.js)**  

- Located in `src/app/`
- Provides a browser-based chat sidebar powered by CopilotKit
- The API route at `src/app/api/copilotkit/route.ts` wires together the CopilotRuntime, BuiltInAgent, and MCPAppsMiddleware
- Uses OpenRouter as the LLM provider (configured via `OPENAI_BASE_URL` environment variable)

**Layer 2: HTTP MCP Server**  

- Located in `mcp-server/`
- An Express server using StreamableHTTPServerTransport from the MCP SDK
- Registers tools that return `_meta.ui/resourceUri` references to HTML app resources
- Serves self-contained HTML apps that CopilotKit renders in sandboxed iframes
- Runs on port 3001 by default

**Layer 3: MCP Server Integrations**  

- Configured in `.mcp.json` with 9 pre-configured servers
- These use stdio transport and are designed for Claude Code CLI/IDE usage
- Includes: n8n (workflow automation), Tavily (search), Vapi (voice), Zep (docs/memory), Pinecone (vectors), Apify (scraping), Supabase (database), OpenRouter (LLM routing), Google Workspace

## The MCP Apps Pattern

The core pattern works like this:

1. A user sends a message in the CopilotSidebar
2. CopilotKit's BuiltInAgent processes the message via OpenRouter
3. The agent decides to call an MCP tool (e.g., `get-workflow-status`)
4. MCPAppsMiddleware sends the tool call to the HTTP MCP server
5. The tool returns data + a `_meta.ui/resourceUri` reference
6. CopilotKit fetches the referenced HTML resource from the MCP server
7. The HTML app is rendered in a sandboxed iframe within the chat

## How to Add New MCP Apps

1. Create a self-contained HTML file in `mcp-server/src/apps/`
2. Register a new tool in `mcp-server/src/server.ts` with `_meta.ui/resourceUri`
3. Register a new resource in `mcp-server/src/server.ts` that serves the HTML
4. Restart the MCP server

## How to Operate

**1. Look for existing tools first**
Before building anything new, check `mcp-server/src/` for existing tools. Only add new ones when nothing covers the task.

**2. Learn and adapt when things fail**  

When you hit an error:

- Read the full error message and trace
- Fix the code and retest
- Document what you learned so it doesn't happen again

**3. Keep things current**
When you find better methods, discover constraints, or encounter recurring issues, update the relevant code and documentation.

## File Structure

```txt
.claude/                # Claude Code settings
mcp-server/             # HTTP MCP server with UI-generating tools
  src/server.ts         # Express + MCP SDK server
  src/apps/             # Self-contained HTML apps for UI rendering
src/app/                # Next.js App Router pages and API routes
  api/copilotkit/       # CopilotKit runtime endpoint
.env                    # API keys and environment variables (NEVER commit)
.env.example            # Template showing required env vars
.mcp.json               # MCP server configuration (9 pre-configured servers)
CLAUDE.md               # This file
README.md               # Project setup and usage guide
```

## Running the Project

```bash
npm run setup           # Install all dependencies (root + mcp-server)
npm run dev:all         # Start Next.js (port 3000) + MCP server (port 3001)
```

## Bottom Line

This framework connects CopilotKit's generative UI capabilities with MCP servers. The HTTP MCP server demonstrates how tools can return interactive HTML interfaces. The pre-configured MCP integrations provide a starting point for extending the system with real data sources.

Stay pragmatic. Stay reliable. Keep learning.
