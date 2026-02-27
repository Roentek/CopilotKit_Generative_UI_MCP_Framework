import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { BuiltInAgent } from "@copilotkit/runtime/v2";
import { NextRequest } from "next/server";

// Use GPT-4 to avoid Anthropic API key issues (stable model)
const OPENROUTER_MODEL = "openai/gpt-4o";

// Create the agent - Frontend Tools are registered automatically from useFrontendTool
const agent = new BuiltInAgent({
  model: OPENROUTER_MODEL,
  prompt: `You are a helpful assistant with access to INTERACTIVE UI TOOLS.

CRITICAL: You MUST use tools to show visual information. NEVER just describe what would be shown.

INSTRUCTIONS:
- When user asks to "show", "display", or "see" workflows → Call get-workflow-status tool
- When user asks "what's running" or "status" → Call get-workflow-status tool
- ALWAYS prefer calling tools over text descriptions
- The tools will render beautiful interactive UI components automatically

Be concise in your text responses. Let the UI tools do the heavy lifting for visualization.`,
});

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
