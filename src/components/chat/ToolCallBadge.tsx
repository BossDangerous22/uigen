import { Loader2, CheckCircle2 } from "lucide-react";
import type { ToolInvocation } from "ai";

function getFriendlyMessage(toolName: string, args: Record<string, unknown>): string {
  const path = typeof args.path === "string" ? ` ${args.path}` : "";

  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":
        return `Creating file${path}`;
      case "str_replace":
      case "insert":
        return `Modifying file${path}`;
      case "view":
        return `Reading file${path}`;
      case "undo_edit":
        return `Undoing edit${path}`;
    }
  }

  if (toolName === "file_manager") {
    switch (args.command) {
      case "rename":
        return `Renaming file${path}`;
      case "delete":
        return `Deleting file${path}`;
    }
  }

  return toolName;
}

interface ToolCallBadgeProps {
  toolInvocation: ToolInvocation;
}

export function ToolCallBadge({ toolInvocation }: ToolCallBadgeProps) {
  const { toolName, args, state } = toolInvocation;
  const isDone = state === "result" && "result" in toolInvocation && toolInvocation.result;
  const message = getFriendlyMessage(toolName, args as Record<string, unknown>);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{message}</span>
    </div>
  );
}

export { getFriendlyMessage };
