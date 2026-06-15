import path from "node:path";
import { readFile } from "node:fs/promises";
import type { PolicyRule } from "../types/index.js";
import { builtInRules } from "../rules/builtInRules.js";
import { MarkdownPolicyParser } from "./markdownPolicyParser.js";
import { PolicyDiscovery } from "./policyDiscovery.js";
import { RuleCompiler } from "./ruleCompiler.js";

const DEFAULT_CACHE_TTL_MS = 5_000;

export class CachedPolicyParser {
  private ruleCache: PolicyRule[] | undefined;
  private lastCheckedTime = 0;
  private cachedWorkspaceRoot: string | undefined;

  constructor(
    private readonly cacheTtlMs: number = DEFAULT_CACHE_TTL_MS,
    private readonly discoveryFactory: (workspaceRoot: string) => PolicyDiscovery =
      (workspaceRoot) => new PolicyDiscovery(workspaceRoot),
    private readonly markdownParser: MarkdownPolicyParser = new MarkdownPolicyParser(),
    private readonly ruleCompiler: RuleCompiler = new RuleCompiler()
  ) {}

  async loadWorkspacePolicies(workspaceRoot: string): Promise<PolicyRule[]> {
    const now = Date.now();
    const normalizedWorkspaceRoot = path.resolve(workspaceRoot);

    if (
      this.ruleCache &&
      this.cachedWorkspaceRoot === normalizedWorkspaceRoot &&
      now - this.lastCheckedTime < this.cacheTtlMs
    ) {
      return this.ruleCache;
    }

    try {
      const compiledRules = await this.parsePolicyFiles(normalizedWorkspaceRoot);
      this.ruleCache = compiledRules;
      this.cachedWorkspaceRoot = normalizedWorkspaceRoot;
      this.lastCheckedTime = now;
      return compiledRules;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown cache compilation error";
      console.error(`[Gatekeeper] Policy cache compilation failure: ${message}`);
      return this.cachedWorkspaceRoot === normalizedWorkspaceRoot && this.ruleCache
        ? this.ruleCache
        : builtInRules;
    }
  }

  private async parsePolicyFiles(workspaceRoot: string): Promise<PolicyRule[]> {
    const discovery = this.discoveryFactory(workspaceRoot);
    const markdownRules: PolicyRule[] = [];
    const policyFiles = await discovery.discoverPolicyFiles();

    for (const policyFile of policyFiles) {
      try {
        const policyContent = await readFile(policyFile, "utf8");
        markdownRules.push(...this.markdownParser.parse(policyContent));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown policy read error";
        console.error(`[Gatekeeper] Policy file skipped: ${policyFile}. ${message}`);
      }
    }

    return this.ruleCompiler.compile(builtInRules, markdownRules);
  }
}
