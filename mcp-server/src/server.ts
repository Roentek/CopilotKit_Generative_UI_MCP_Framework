import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.MCP_PORT || "3001", 10);

// In-memory session storage
const transports: Record<string, StreamableHTTPServerTransport> = {};

// Load HTML app templates from the apps directory
function loadApp(filename: string): string {
  return readFileSync(resolve(__dirname, "apps", filename), "utf-8");
}

// Factory: create a new MCP server instance with tools and resources
function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "generative-ui-server",
    version: "1.0.0",
  });

  // ---- TOOL: get-workflow-status ----
  // Returns workflow data AND references a UI resource via _meta
  server.tool(
    "get-workflow-status",
    "Get the current status of workflows. Returns an interactive dashboard UI.",
    {
      workflowName: z.string().optional().describe("Filter by workflow name"),
    },
    async ({ workflowName }) => {
      // Sample workflow data (replace with real data sources in production)
      const workflows = [
        {
          name: "Data Scraping Pipeline",
          status: "active",
          lastRun: "2026-02-04T10:30:00Z",
          success: true,
          executions: 142,
        },
        {
          name: "Email Notification",
          status: "active",
          lastRun: "2026-02-04T09:15:00Z",
          success: true,
          executions: 89,
        },
        {
          name: "Report Generator",
          status: "paused",
          lastRun: "2026-02-03T18:00:00Z",
          success: false,
          executions: 37,
        },
        {
          name: "Database Sync",
          status: "active",
          lastRun: "2026-02-04T11:00:00Z",
          success: true,
          executions: 256,
        },
        {
          name: "API Health Monitor",
          status: "active",
          lastRun: "2026-02-04T11:45:00Z",
          success: true,
          executions: 1024,
        },
      ];

      const filtered = workflowName
        ? workflows.filter((w) =>
            w.name.toLowerCase().includes(workflowName.toLowerCase())
          )
        : workflows;

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              { workflows: filtered, total: filtered.length },
              null,
              2
            ),
          },
        ],
        _meta: {
          "ui/resourceUri": "ui://generative-ui/workflow-dashboard",
        },
      };
    }
  );

  // ---- TOOL: manage-task ----
  // Plain text tool without UI (demonstrates mixed tool types)
  server.tool(
    "manage-task",
    "Create, update, or list tasks.",
    {
      action: z
        .enum(["create", "list", "complete"])
        .describe("Action to perform"),
      taskName: z.string().optional().describe("Name of the task"),
    },
    async ({ action, taskName }) => {
      const responses: Record<string, string> = {
        create: `Task "${taskName || "Untitled"}" created successfully.`,
        list: "Current tasks:\n1. Review API integration (In Progress)\n2. Update workflow documentation (Pending)\n3. Test MCP server endpoints (Pending)\n4. Deploy to staging (Blocked)\n5. Write unit tests for dashboard (Pending)",
        complete: `Task "${taskName || "Untitled"}" marked as complete.`,
      };

      return {
        content: [
          { type: "text" as const, text: responses[action] || "Unknown action." },
        ],
      };
    }
  );

  // ---- RESOURCE: workflow-dashboard HTML app ----
  // Served as an MCP App resource; CopilotKit renders it in a sandboxed iframe
  server.resource(
    "workflow-dashboard",
    "ui://generative-ui/workflow-dashboard",
    {
      description: "Interactive workflow status dashboard",
      mimeType: "text/html+mcp",
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: "text/html+mcp",
          text: loadApp("workflow-dashboard.html"),
        },
      ],
    })
  );

  return server;
}

// ---- Express server with Streamable HTTP transport ----
const app = express();
app.use(cors());
app.use(express.json());

// POST /mcp - Main MCP endpoint (client-to-server messages)
app.post("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  let transport: StreamableHTTPServerTransport;

  if (sessionId && transports[sessionId]) {
    // Existing session
    transport = transports[sessionId];
  } else if (!sessionId && isInitializeRequest(req.body)) {
    // New session initialization
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (id: string) => {
        transports[id] = transport;
      },
    });

    transport.onclose = () => {
      if (transport.sessionId) {
        delete transports[transport.sessionId];
      }
    };

    const server = createMcpServer();
    await server.connect(transport);
  } else {
    res.status(400).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Bad Request: No valid session ID" },
      id: null,
    });
    return;
  }

  await transport.handleRequest(req, res, req.body);
});

// GET /mcp - SSE notifications for existing sessions
app.get("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send("Invalid or missing session ID");
    return;
  }
  await transports[sessionId].handleRequest(req, res);
});

// DELETE /mcp - Session cleanup
app.delete("/mcp", async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send("Invalid or missing session ID");
    return;
  }
  await transports[sessionId].handleRequest(req, res);
});

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    server: "generative-ui-mcp-server",
    sessions: Object.keys(transports).length,
  });
});

// Start
app.listen(PORT, () => {
  console.log(`Generative UI MCP Server listening on http://localhost:${PORT}/mcp`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
