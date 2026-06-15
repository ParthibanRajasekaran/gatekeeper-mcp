#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const serverPath = path.join(root, "dist", "index.js");
const failingDiff = await readFile(path.join(root, "demo", "failing-diff.patch"), "utf8");
const passingDiff = await readFile(path.join(root, "demo", "passing-diff.patch"), "utf8");

const child = spawn(process.execPath, [serverPath], {
  cwd: root,
  env: {
    ...process.env,
    GATEKEEPER_WORKSPACE: root
  },
  stdio: ["pipe", "pipe", "pipe"]
});

let stdoutBuffer = "";
let stderrBuffer = "";
let nextId = 1;

child.stdout.setEncoding("utf8");
child.stderr.setEncoding("utf8");

child.stdout.on("data", (chunk) => {
  stdoutBuffer += chunk;
});

child.stderr.on("data", (chunk) => {
  stderrBuffer += chunk;
});

function sendMessage(message) {
  const payload = JSON.stringify(message);
  child.stdin.write(`Content-Length: ${Buffer.byteLength(payload, "utf8")}\r\n\r\n${payload}`);
}

function readMessages() {
  const messages = [];

  while (true) {
    const headerEnd = stdoutBuffer.indexOf("\r\n\r\n");
    if (headerEnd === -1) {
      break;
    }

    const header = stdoutBuffer.slice(0, headerEnd);
    const lengthMatch = /Content-Length: (\d+)/i.exec(header);
    if (!lengthMatch) {
      throw new Error(`Invalid MCP response header: ${header}`);
    }

    const contentLength = Number.parseInt(lengthMatch[1], 10);
    const bodyStart = headerEnd + 4;
    const bodyEnd = bodyStart + contentLength;

    if (stdoutBuffer.length < bodyEnd) {
      break;
    }

    const body = stdoutBuffer.slice(bodyStart, bodyEnd);
    stdoutBuffer = stdoutBuffer.slice(bodyEnd);
    messages.push(JSON.parse(body));
  }

  return messages;
}

async function waitForResponse(id, timeoutMs = 5_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const messages = readMessages();
    const match = messages.find((message) => message.id === id);

    if (match) {
      return match;
    }

    await new Promise((resolve) => setTimeout(resolve, 25));
  }

  throw new Error(`Timed out waiting for MCP response id ${id}. stderr: ${stderrBuffer}`);
}

async function request(method, params) {
  const id = nextId;
  nextId += 1;
  sendMessage({ jsonrpc: "2.0", id, method, params });
  const response = await waitForResponse(id);

  if (response.error) {
    throw new Error(`MCP error for ${method}: ${JSON.stringify(response.error)}`);
  }

  return response.result;
}

function notification(method, params) {
  sendMessage({ jsonrpc: "2.0", method, params });
}

try {
  await request("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: {
      name: "gatekeeper-smoke-test",
      version: "0.1.0"
    }
  });

  notification("notifications/initialized", {});

  const failingResult = await request("tools/call", {
    name: "gatekeeper_audit_diff",
    arguments: {
      filePath: "src/api/users.ts",
      language: "typescript",
      diffString: failingDiff
    }
  });

  const failingText = failingResult.content?.[0]?.text ?? "";
  if (!failingText.includes("Audit Results: FAIL") || !failingText.includes("ARCH-001")) {
    throw new Error(`Expected failing diff to trigger ARCH-001. Actual output: ${failingText}`);
  }

  const passingResult = await request("tools/call", {
    name: "gatekeeper_audit_diff",
    arguments: {
      filePath: "src/api/users.ts",
      language: "typescript",
      diffString: passingDiff
    }
  });

  const passingText = passingResult.content?.[0]?.text ?? "";
  if (!passingText.includes("Audit Results: PASS")) {
    throw new Error(`Expected passing diff to pass audit. Actual output: ${passingText}`);
  }

  child.kill("SIGTERM");
  console.error("Gatekeeper-MCP smoke test passed.");
} catch (error) {
  child.kill("SIGTERM");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
