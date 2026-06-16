#!/usr/bin/env node
import { spawn } from "node:child_process";
import process from "node:process";

function runCli(args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ["dist/cli.js", ...args], {
      cwd: process.cwd(),
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");

    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });

    child.on("close", (exitCode) => {
      resolve({ exitCode, stdout, stderr });
    });
  });
}

function assertIncludes(label, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${label} expected output to include ${JSON.stringify(expected)}. Actual output:\n${text}`);
  }
}

const failingResult = await runCli([
  "audit",
  "--diff",
  "demo/failing-diff.patch",
  "--file",
  "src/api/users.ts",
  "--language",
  "typescript"
]);

if (failingResult.exitCode !== 1) {
  throw new Error(`Expected failing diff exit code 1, got ${failingResult.exitCode}.\nstdout:\n${failingResult.stdout}\nstderr:\n${failingResult.stderr}`);
}

assertIncludes("failing diff", failingResult.stdout, "Audit Results: FAIL");
assertIncludes("failing diff", failingResult.stdout, "ARCH-001");

const passingResult = await runCli([
  "audit",
  "--diff",
  "demo/passing-diff.patch",
  "--file",
  "src/api/users.ts",
  "--language",
  "typescript"
]);

if (passingResult.exitCode !== 0) {
  throw new Error(`Expected passing diff exit code 0, got ${passingResult.exitCode}.\nstdout:\n${passingResult.stdout}\nstderr:\n${passingResult.stderr}`);
}

assertIncludes("passing diff", passingResult.stdout, "Audit Results: PASS");

console.error("Gatekeeper-MCP CLI smoke test passed.");
