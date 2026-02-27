"use client";

import { useFrontendTool } from "@copilotkit/react-core";
import { z } from "zod";

// Workflow data type
interface Workflow {
  name: string;
  status: "active" | "paused";
  lastRun: string;
  success: boolean;
  executions: number;
}

// Sample workflow data
const sampleWorkflows: Workflow[] = [
  {
    name: "Data Scraping Pipeline",
    status: "active",
    lastRun: new Date().toISOString(),
    success: true,
    executions: 142,
  },
  {
    name: "Email Notification",
    status: "active",
    lastRun: new Date(Date.now() - 3600000).toISOString(),
    success: true,
    executions: 89,
  },
  {
    name: "Report Generator",
    status: "paused",
    lastRun: new Date(Date.now() - 86400000).toISOString(),
    success: false,
    executions: 37,
  },
  {
    name: "Database Sync",
    status: "active",
    lastRun: new Date(Date.now() - 1800000).toISOString(),
    success: true,
    executions: 256,
  },
  {
    name: "API Health Monitor",
    status: "active",
    lastRun: new Date(Date.now() - 600000).toISOString(),
    success: true,
    executions: 1024,
  },
];

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return Math.floor(diff / 86400) + "d ago";
}

export function WorkflowDashboardTool() {
  useFrontendTool({
    name: "get-workflow-status",
    description:
      "Shows an interactive workflow status dashboard with real-time workflow information",
    parameters: [
      {
        name: "workflowName",
        type: "string",
        description: "Optional filter by workflow name",
        required: false,
      },
    ] as const,
    handler: async ({ workflowName }) => {
      // Filter workflows if name provided
      const filtered = workflowName
        ? sampleWorkflows.filter((w) =>
            w.name.toLowerCase().includes(workflowName.toLowerCase())
          )
        : sampleWorkflows;

      return {
        workflows: filtered,
        total: filtered.length,
      };
    },
    render: ({ status, args, result }) => {
      if (status === "inProgress" || status === "executing") {
        return (
          <div className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-900">
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
              <span className="text-sm">Loading workflows...</span>
            </div>
          </div>
        );
      }

      if (!result || !result.workflows) {
        return (
          <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950">
            <p className="text-sm text-red-600 dark:text-red-400">
              Failed to load workflows
            </p>
          </div>
        );
      }

      const workflows = result.workflows as Workflow[];
      const active = workflows.filter((w) => w.status === "active").length;
      const paused = workflows.filter((w) => w.status === "paused").length;
      const failed = workflows.filter((w) => w.success === false).length;
      const totalExec = workflows.reduce(
        (sum, w) => sum + (w.executions || 0),
        0
      );

      return (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 p-4">
          <h3 className="text-lg font-semibold mb-4">
            Workflow Status Dashboard
          </h3>

          {workflows.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              No workflows found
              {args.workflowName && ` matching "${args.workflowName}"`}
            </div>
          ) : (
            <>
              <div className="space-y-2 mb-4">
                {workflows.map((workflow, idx) => {
                  const statusClass =
                    workflow.success === false
                      ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                      : workflow.status === "active"
                      ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300";

                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-sm">
                          {workflow.name}
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 flex gap-3 mt-1">
                          <span>
                            Last run: {getTimeAgo(new Date(workflow.lastRun))}
                          </span>
                          <span>{workflow.executions} executions</span>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-medium px-3 py-1 rounded-full uppercase ${statusClass}`}
                      >
                        {workflow.success === false
                          ? "FAILED"
                          : workflow.status.toUpperCase()}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {workflows.length}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 uppercase">
                      Total
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {active}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 uppercase">
                      Active
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {paused}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 uppercase">
                      Paused
                    </div>
                  </div>
                  {failed > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {failed}
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-400 uppercase">
                        Failed
                      </div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {totalExec.toLocaleString()}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 uppercase">
                      Executions
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      );
    },
  });

  return null; // This component just registers the tool, doesn't render anything
}
