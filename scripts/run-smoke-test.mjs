#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const root = process.cwd();
const serverPath = path.join(root, "dist", "index.js");
const failingDiff = await readFile(path.join(root, "demo", "failing-diff.patch"), "utf8");
const passingDiff = await readFile(path.join(root, "demo", "passing-diff.patch"), "utf8");

const transport = new StdioClientTransport({
  command: process.execPath,
  args: [serverPath],
  env: {
    ...process.env,
    GATEKEEPER_WORKSPACE: root
  },
  stderr: "pipe"
});

const client = new Client({
  name: "gatekeeper-smoke-test",
  version: "0.1.0"
});

function extractText(result) {
  const content = result?.content;

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .filter((item) => item?.type === "text")
    .map((item) => item.text ?? "")
    .join("\n");
}

try {
  await client.connect(transport);

  const failingResult = await client.callTool({
    name: "gatekeeper_audit_diff",
    arguments: {
      filePath: "src/api/users.ts",
      language: "typescript",
      diffString: failingDiff
    }
  });

  const failingText = extractText(failingResult);
  if (!failingText.includes("Audit Results: FAIL") || !failingText.includes("ARCH-001")) {
    throw new Error(`Expected failing diff to trigger ARCH-001. Actual output: ${failingText}`);
  }

  const passingResult = await client.callTool({
    name: "gatekeeper_audit_diff",
    arguments: {
      filePath: "src/api/users.ts",
      language: "typescript",
      diffString: passingDiff
    }
  });

  const passingText = extractText(passingResult);
  if (!passingText.includes("Audit Results: PASS")) {
    throw new Error(`Expected passing diff to pass audit. Actual output: ${passingText}`);
  }

  await client.close();
  console.error("Gatekeeper-MCP smoke test passed.");
} catch (error) {
  try {
    await client.close();
  } catch {
    // Ignore shutdown errors during failed smoke tests.
  }

  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
