import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { BuiltInAgent } from "@copilotkit/runtime/v2";
import { NextRequest } from "next/server";
import { MCPAppsMiddleware } from "@ag-ui/mcp-apps-middleware";

const MCP_SERVER_URL =
  process.env.MCP_SERVER_URL || "http://localhost:3001/mcp";

// Create the agent with MCP Apps middleware
// Note: Type assertion needed due to duplicate @ag-ui/client versions
// between @copilotkit/runtime and @ag-ui/mcp-apps-middleware
const agent = new BuiltInAgent({
  model: "openai/gpt-4o",
  prompt: `You are a helpful assistant integrated with the CopilotKit Generative UI MCP Framework.
You have access to MCP tools that can return interactive UI components.
When a tool returns UI, it will be rendered inline in the chat as an interactive widget.
Help the user interact with workflows, check statuses, and manage tasks.
When asked to show or display something, use the appropriate tool.`,
}).use(
  new MCPAppsMiddleware({
    mcpServers: [
      {
        type: "http",
        url: MCP_SERVER_URL,
        serverId: "generative-ui-server",
      },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any
);

const serviceAdapter = new ExperimentalEmptyAdapter();

const runtime = new CopilotRuntime({
  agents: {
    default: agent,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
