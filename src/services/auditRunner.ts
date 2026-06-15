import { CachedPolicyParser } from "./cachedPolicyParser.js";
import { DiffAnalyzer } from "./diffAnalyzer.js";
import type { AuditDiffInput, AuditResponse } from "../types/index.js";

export type AuditRunnerOptions = {
  workspaceRoot: string;
  policyParser?: CachedPolicyParser;
};

export async function runGatekeeperAudit(
  input: AuditDiffInput,
  options: AuditRunnerOptions
): Promise<AuditResponse> {
  const analyzer = new DiffAnalyzer();
  const policyParser = options.policyParser ?? new CachedPolicyParser();
  const rules = await policyParser.loadWorkspacePolicies(options.workspaceRoot);

  return analyzer.runRules(input, rules);
}
