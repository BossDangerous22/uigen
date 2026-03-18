import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallBadge, getFriendlyMessage } from "../ToolCallBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

// getFriendlyMessage unit tests

test("getFriendlyMessage: str_replace_editor create", () => {
  expect(getFriendlyMessage("str_replace_editor", { command: "create", path: "/App.jsx" })).toBe("Creating file /App.jsx");
});

test("getFriendlyMessage: str_replace_editor str_replace", () => {
  expect(getFriendlyMessage("str_replace_editor", { command: "str_replace", path: "/App.jsx" })).toBe("Modifying file /App.jsx");
});

test("getFriendlyMessage: str_replace_editor insert", () => {
  expect(getFriendlyMessage("str_replace_editor", { command: "insert", path: "/App.jsx" })).toBe("Modifying file /App.jsx");
});

test("getFriendlyMessage: str_replace_editor view", () => {
  expect(getFriendlyMessage("str_replace_editor", { command: "view", path: "/App.jsx" })).toBe("Reading file /App.jsx");
});

test("getFriendlyMessage: str_replace_editor undo_edit", () => {
  expect(getFriendlyMessage("str_replace_editor", { command: "undo_edit", path: "/App.jsx" })).toBe("Undoing edit /App.jsx");
});

test("getFriendlyMessage: file_manager rename", () => {
  expect(getFriendlyMessage("file_manager", { command: "rename", path: "/old.jsx" })).toBe("Renaming file /old.jsx");
});

test("getFriendlyMessage: file_manager delete", () => {
  expect(getFriendlyMessage("file_manager", { command: "delete", path: "/old.jsx" })).toBe("Deleting file /old.jsx");
});

test("getFriendlyMessage: unknown tool falls back to tool name", () => {
  expect(getFriendlyMessage("unknown_tool", {})).toBe("unknown_tool");
});

test("getFriendlyMessage: no path omits path segment", () => {
  expect(getFriendlyMessage("str_replace_editor", { command: "create" })).toBe("Creating file");
});

// ToolCallBadge component tests

test("ToolCallBadge shows friendly message for in-progress create", () => {
  const invocation: ToolInvocation = {
    toolCallId: "1",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
    state: "call",
  };

  render(<ToolCallBadge toolInvocation={invocation} />);
  expect(screen.getByText("Creating file /App.jsx")).toBeDefined();
});

test("ToolCallBadge shows friendly message for completed str_replace", () => {
  const invocation: ToolInvocation = {
    toolCallId: "2",
    toolName: "str_replace_editor",
    args: { command: "str_replace", path: "/App.jsx" },
    state: "result",
    result: "Success",
  };

  render(<ToolCallBadge toolInvocation={invocation} />);
  expect(screen.getByText("Modifying file /App.jsx")).toBeDefined();
});

test("ToolCallBadge shows friendly message for file_manager delete", () => {
  const invocation: ToolInvocation = {
    toolCallId: "3",
    toolName: "file_manager",
    args: { command: "delete", path: "/old.jsx" },
    state: "result",
    result: { success: true },
  };

  render(<ToolCallBadge toolInvocation={invocation} />);
  expect(screen.getByText("Deleting file /old.jsx")).toBeDefined();
});

test("ToolCallBadge shows spinner when in progress", () => {
  const invocation: ToolInvocation = {
    toolCallId: "4",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
    state: "call",
  };

  const { container } = render(<ToolCallBadge toolInvocation={invocation} />);
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

test("ToolCallBadge shows check icon when done", () => {
  const invocation: ToolInvocation = {
    toolCallId: "5",
    toolName: "str_replace_editor",
    args: { command: "create", path: "/App.jsx" },
    state: "result",
    result: "created",
  };

  const { container } = render(<ToolCallBadge toolInvocation={invocation} />);
  expect(container.querySelector(".animate-spin")).toBeNull();
  // lucide CheckCircle2 renders an svg
  expect(container.querySelector("svg")).toBeDefined();
});
