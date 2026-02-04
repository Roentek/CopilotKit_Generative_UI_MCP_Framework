"use client";

import { CopilotSidebar } from "@copilotkit/react-ui";

export default function Home() {
  return (
    <div className="flex min-h-screen">
      <main className="flex-1 p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            CopilotKit Generative UI MCP Framework
          </h1>
          <p className="text-zinc-500 text-lg">
            AI-powered generative UI with MCP Apps, CopilotKit, and OpenRouter.
            Use the assistant to interact with tools that return interactive UI
            components.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-3">MCP Apps Server</h2>
            <p className="text-zinc-500 text-sm mb-3">
              HTTP MCP server with tools that return interactive UI components
              rendered in the chat.
            </p>
            <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
              <li>
                <code className="text-xs bg-zinc-100 dark:bg-zinc-900 px-1 py-0.5 rounded">
                  get-workflow-status
                </code>{" "}
                - Interactive dashboard
              </li>
              <li>
                <code className="text-xs bg-zinc-100 dark:bg-zinc-900 px-1 py-0.5 rounded">
                  manage-task
                </code>{" "}
                - Task management
              </li>
            </ul>
          </div>

          <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-3">
              Pre-configured MCP Servers
            </h2>
            <p className="text-zinc-500 text-sm mb-3">
              9 MCP servers ready for Claude Code CLI/IDE integration.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {[
                "n8n",
                "Tavily",
                "Vapi",
                "Zep",
                "Pinecone",
                "Apify",
                "Supabase",
                "OpenRouter",
                "Google",
              ].map((server) => (
                <span
                  key={server}
                  className="text-xs bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded-full"
                >
                  {server}
                </span>
              ))}
            </div>
          </div>

          <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-3">Getting Started</h2>
            <p className="text-zinc-500 text-sm mb-3">
              Try these commands in the assistant:
            </p>
            <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
              <li>&quot;Show workflow status&quot;</li>
              <li>&quot;List my tasks&quot;</li>
              <li>&quot;Create a task called Review PR&quot;</li>
            </ul>
          </div>
        </div>

        <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 bg-zinc-50 dark:bg-zinc-950">
          <h2 className="text-lg font-semibold mb-2">How It Works</h2>
          <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
            <p>
              <strong>1.</strong> You send a message in the CopilotSidebar
              (right panel)
            </p>
            <p>
              <strong>2.</strong> CopilotKit routes your message to the LLM via
              OpenRouter
            </p>
            <p>
              <strong>3.</strong> The LLM decides which MCP tool to call via
              MCPAppsMiddleware
            </p>
            <p>
              <strong>4.</strong> The MCP server returns data + a reference to an
              HTML app
            </p>
            <p>
              <strong>5.</strong> CopilotKit renders the HTML app as an
              interactive widget in the chat
            </p>
          </div>
        </div>
      </main>

      <CopilotSidebar
        defaultOpen={true}
        labels={{
          title: "Generative UI Assistant",
          initial:
            "Hi! I can help you interact with your tools. Try asking me to show the workflow dashboard or manage tasks.",
        }}
      />
    </div>
  );
}
