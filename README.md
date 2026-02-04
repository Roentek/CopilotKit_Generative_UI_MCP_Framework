# CopilotKit Generative UI MCP Framework

A plug-and-play framework for building AI-powered generative user interfaces using [CopilotKit](https://copilotkit.ai), [MCP Apps](https://docs.copilotkit.ai/generative-ui-specs/mcp-apps), and [OpenRouter](https://openrouter.ai). MCP server tools return interactive HTML components that render directly in a browser-based chat interface.

This project includes a Next.js frontend with CopilotKit, an HTTP MCP server with sample UI-generating tools, and 9 pre-configured MCP server integrations for Claude Code.

## Architecture

```text
Browser (localhost:3000)
    |
    |  User sends message in CopilotSidebar
    v
Next.js API Route (/api/copilotkit)
    |
    |  BuiltInAgent routes to OpenRouter (LLM)
    v
MCPAppsMiddleware
    |
    |  HTTP request to MCP server (localhost:3001/mcp)
    |  Tool returns data + _meta.ui/resourceUri reference
    v
CopilotKit Frontend
    |
    |  Fetches HTML resource from MCP server
    |  Renders interactive UI in sandboxed iframe
    v
User sees interactive dashboard in the chat sidebar
```

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/Roentek/CopilotKit_Generative_UI_MCP_Framework.git
cd CopilotKit_Generative_UI_MCP_Framework
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your API keys. At minimum you need:

```env
OPENAI_API_KEY=your-openrouter-api-key
OPENAI_BASE_URL=https://openrouter.ai/api/v1
```

### 3. Install dependencies and run

```bash
npm run setup       # Installs root + MCP server dependencies
npm run dev:all     # Starts Next.js (port 3000) + MCP server (port 3001)
```

Open [http://localhost:3000](http://localhost:3000) and try asking the assistant: **"Show workflow status"**

## Prerequisites

- **Node.js 18+** and **npm**
- **OpenRouter API key** ([get one here](https://openrouter.ai/keys)) -- or any OpenAI-compatible LLM provider
- **Claude Code CLI** (optional, for using the pre-configured MCP servers)

## Project Structure

```text
CopilotKit_Generative_UI_MCP_Framework/
├── .claude/                           # Claude Code settings
│   ├── settings.json                  #   Enabled plugins
│   └── settings.local.json            #   Permissions + MCP server config
├── mcp-server/                        # HTTP MCP server for generative UI
│   ├── package.json                   #   Server dependencies
│   ├── tsconfig.json                  #   TypeScript config
│   └── src/
│       ├── server.ts                  #   Express + StreamableHTTPServerTransport
│       └── apps/
│           └── workflow-dashboard.html #   Sample interactive HTML app
├── src/
│   └── app/
│       ├── layout.tsx                 # CopilotKit provider wrapper
│       ├── page.tsx                   # Dashboard + CopilotSidebar
│       ├── globals.css                # Tailwind base styles
│       └── api/
│           └── copilotkit/
│               └── route.ts           # CopilotRuntime + MCPAppsMiddleware
├── .env.example                       # Environment variable template
├── .mcp.json                          # 9 pre-configured MCP servers
├── CLAUDE.md                          # AI agent instructions
├── LICENSE                            # MIT License
├── package.json                       # Next.js + CopilotKit dependencies
└── README.md                          # This file
```

## Environment Variables

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `OPENAI_API_KEY` | Yes | Your OpenRouter API key (used by CopilotKit runtime) |
| `OPENAI_BASE_URL` | Yes | Set to `https://openrouter.ai/api/v1` for OpenRouter |
| `MCP_SERVER_URL` | No | MCP server URL (defaults to `http://localhost:3001/mcp`) |
| `SUPABASE_API_PAT` | No | Supabase MCP access token |
| `PINECONE_API_KEY` | No | Pinecone vector DB API key |
| `APIFY_API_PAT` | No | Apify web scraping access token |
| `TAVILY_API_KEY` | No | Tavily search API key |
| `VAPI_API_TOKEN` | No | Vapi voice MCP server token |
| `N8N_HOST_URL` | No | n8n instance URL |
| `N8N_API_KEY` | No | n8n API key |
| `GOOGLE_USER_EMAIL` | No | Google Workspace email |
| `GOOGLE_OAUTH_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_OAUTH_CLIENT_SECRET` | No | Google OAuth client secret |
| `OPENROUTER_API_KEY` | No | OpenRouter key for MCP server integration |

## Pre-configured MCP Server Integrations

These 9 MCP servers are configured in `.mcp.json` for use with Claude Code CLI/IDE:

| Server | Purpose | Transport |
| ------ | ------- | --------- |
| **n8n** | Workflow automation | stdio |
| **Tavily** | Web search and research | stdio |
| **Vapi** | Voice and call API | stdio |
| **Zep** | Documentation and memory | remote |
| **Pinecone** | Vector database | stdio |
| **Apify** | Web scraping | stdio |
| **Supabase** | Database operations | stdio |
| **OpenRouter** | LLM routing | stdio |
| **Google Workspace** | Google services | stdio |

## Available NPM Scripts

| Script | Description |
| ------ | ----------- |
| `npm run setup` | Install all dependencies (root + MCP server) |
| `npm run dev:all` | Start Next.js + MCP server concurrently |
| `npm run dev` | Start Next.js development server only |
| `npm run mcp:dev` | Start MCP server only |
| `npm run build` | Build Next.js for production |
| `npm run start` | Start Next.js production server |
| `npm run lint` | Run ESLint |

## How to Add New MCP Apps

The MCP Apps pattern allows tools to return interactive UI. Here's how to add a new one:

### Step 1: Create the HTML app

Create a self-contained HTML file in `mcp-server/src/apps/`. It must include all CSS and JavaScript inline (no external dependencies). The app receives data via `window.addEventListener("message", ...)`.

```html
<!-- mcp-server/src/apps/my-app.html -->
<!DOCTYPE html>
<html>
<head>
  <style>/* Your styles here */</style>
</head>
<body>
  <div id="app"></div>
  <script>
    window.addEventListener("message", (event) => {
      const data = typeof event.data === "string"
        ? JSON.parse(event.data)
        : event.data;
      // Render your UI with the data
    });
  </script>
</body>
</html>
```

### Step 2: Register the tool in `mcp-server/src/server.ts`

```typescript
server.tool(
  "my-tool-name",
  "Description of what the tool does",
  { param1: z.string().describe("Parameter description") },
  async ({ param1 }) => {
    const data = { /* your data */ };
    return {
      content: [{ type: "text" as const, text: JSON.stringify(data) }],
      _meta: { "ui/resourceUri": "ui://generative-ui/my-app" },
    };
  }
);
```

### Step 3: Register the resource

```typescript
server.resource(
  "my-app",
  "ui://generative-ui/my-app",
  { description: "My interactive app", mimeType: "text/html+mcp" },
  async (uri) => ({
    contents: [{
      uri: uri.href,
      mimeType: "text/html+mcp",
      text: loadApp("my-app.html"),
    }],
  })
);
```

### Step 4: Restart the MCP server

```bash
npm run mcp:dev
```

## OpenRouter Configuration

This framework uses [OpenRouter](https://openrouter.ai) as the LLM provider. CopilotKit's runtime uses the OpenAI SDK internally, so by setting `OPENAI_BASE_URL` to `https://openrouter.ai/api/v1` and `OPENAI_API_KEY` to your OpenRouter key, all LLM calls route through OpenRouter transparently.

The default model is `openai/gpt-4o`. To change it, edit the `model` field in [route.ts](src/app/api/copilotkit/route.ts):

```typescript
const agent = new BuiltInAgent({
  model: "anthropic/claude-sonnet-4",  // Any OpenRouter model
  prompt: "...",
})
```

See [OpenRouter models](https://openrouter.ai/models) for available options.

## Troubleshooting

**MCP server not responding:**
Check that the MCP server is running on port 3001. Run `npm run mcp:dev` separately to see its logs. Visit `http://localhost:3001/health` to verify.

**CopilotSidebar shows errors:**
Ensure `OPENAI_API_KEY` and `OPENAI_BASE_URL` are set in your `.env` file. The API route at `/api/copilotkit` needs these to communicate with OpenRouter.

**TypeScript type errors with MCPAppsMiddleware:**
This is a known issue with duplicate `@ag-ui/client` packages. The [route.ts](src/app/api/copilotkit/route.ts) file uses `as any` type assertions to work around this. Run `npm dedupe` if you see issues after installing new packages.

**Port conflicts:**
Next.js runs on port 3000 and the MCP server on port 3001. If these ports are in use, set `PORT` for Next.js via `next dev -p 3002` and `MCP_PORT` environment variable for the MCP server.

## Resources

- [CopilotKit Documentation](https://docs.copilotkit.ai)
- [CopilotKit MCP Apps Spec](https://docs.copilotkit.ai/generative-ui-specs/mcp-apps)
- [MCP Apps Demo Repository](https://github.com/CopilotKit/mcp-apps-demo)
- [Generative UI Guide](https://github.com/CopilotKit/generative-ui)
- [OpenRouter Documentation](https://openrouter.ai/docs)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)

## License

MIT License - Copyright (c) 2026 Roentek Designs

See [LICENSE](LICENSE) for details.
