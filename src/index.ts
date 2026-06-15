#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { registerAuditDiffTool } from "./tools/auditDiff.js";

const config = loadConfig();

const server = new McpServer({
  name: "gatekeeper-mcp",
  version: "0.1.0"
});

registerAuditDiffTool(server, {
  workspaceRoot: config.workspaceRoot
});

const transport = new StdioServerTransport();

console.error(`[Gatekeeper] Starting MCP server for workspace: ${config.workspaceRoot}`);
await server.connect(transport);
