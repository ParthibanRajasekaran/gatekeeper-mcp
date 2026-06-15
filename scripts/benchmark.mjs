#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";
import process from "node:process";
import { DiffAnalyzer } from "../dist/services/diffAnalyzer.js";
import { CachedPolicyParser } from "../dist/services/cachedPolicyParser.js";

const root = process.cwd();
const analyzer = new DiffAnalyzer();
const policyParser = new CachedPolicyParser();
const failingDiff = await readFile(path.join(root, "demo", "failing-diff.patch"), "utf8");
const passingDiff = await readFile(path.join(root, "demo", "passing-diff.patch"), "utf8");

async function measure(label, fn) {
  const start = performance.now();
  const result = await fn();
  const durationMs = performance.now() - start;
  return { label, durationMs, result };
}

const coldPolicyLoad = await measure("policy_load_cold", () =>
  policyParser.loadWorkspacePolicies(root)
);

const warmPolicyLoad = await measure("policy_load_warm", () =>
  policyParser.loadWorkspacePolicies(root)
);

const rules = warmPolicyLoad.result;

const failingAudit = await measure("audit_failing_diff", () =>
  analyzer.runRules(
    {
      filePath: "src/api/users.ts",
      language: "typescript",
      diffString: failingDiff
    },
    rules
  )
);

const passingAudit = await measure("audit_passing_diff", () =>
  analyzer.runRules(
    {
      filePath: "src/api/users.ts",
      language: "typescript",
      diffString: passingDiff
    },
    rules
  )
);

const rows = [coldPolicyLoad, warmPolicyLoad, failingAudit, passingAudit].map((entry) => ({
  metric: entry.label,
  durationMs: Number(entry.durationMs.toFixed(3))
}));

console.error("Gatekeeper-MCP benchmark results");
console.error(JSON.stringify({
  rulesEvaluated: rules.length,
  failingViolations: failingAudit.result.violationsCount,
  passingViolations: passingAudit.result.violationsCount,
  rows
}, null, 2));
