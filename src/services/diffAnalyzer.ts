import type {
  AuditResponse,
  DiffPayload,
  PolicyRule,
  PolicyViolation
} from "../types/index.js";
import { extractDiffAdditions } from "./diffParser.js";
import { buildViolationMessage, getSuggestedFix } from "./remediationEngine.js";

const MAX_PATTERN_LENGTH = 2_000;

type CompiledRule = {
  rule: PolicyRule;
  regex: RegExp;
};

export class DiffAnalyzer {
  async runRules(payload: DiffPayload, rules: PolicyRule[]): Promise<AuditResponse> {
    const diagnostics: string[] = [];
    const additions = extractDiffAdditions(payload.filePath, payload.diffString);
    const activeRules = this.compileActiveRules(payload, rules, diagnostics);
    const violations: PolicyViolation[] = [];

    for (const addition of additions) {
      for (const { rule, regex } of activeRules) {
        regex.lastIndex = 0;

        if (!regex.test(addition.content)) {
          continue;
        }

        const baseViolation = {
          ruleId: rule.id,
          ruleName: rule.name,
          lineStart: addition.lineNumber,
          lineEnd: addition.lineNumber,
          severity: rule.severity,
          message: buildViolationMessage(rule),
          offendingCode: addition.raw
        } satisfies Omit<PolicyViolation, "suggestedFix">;

        const suggestedFix = getSuggestedFix(rule);
        violations.push(
          suggestedFix
            ? { ...baseViolation, suggestedFix }
            : baseViolation
        );
      }
    }

    const blockingViolationCount = violations.filter(
      (violation) => violation.severity === "error" || violation.severity === "warn"
    ).length;

    return {
      isCompliant: blockingViolationCount === 0,
      violationsCount: violations.length,
      violations,
      diagnostics,
      summary:
        blockingViolationCount === 0
          ? "No blocking policy violations were detected."
          : `${blockingViolationCount} blocking policy violation(s) detected.`
    };
  }

  private compileActiveRules(
    payload: DiffPayload,
    rules: PolicyRule[],
    diagnostics: string[]
  ): CompiledRule[] {
    const compiledRules: CompiledRule[] = [];

    for (const rule of rules) {
      if (!rule.enabled) {
        continue;
      }

      if (rule.languages && !rule.languages.includes(payload.language)) {
        continue;
      }

      const regex = this.compileRulePattern(rule, diagnostics);
      if (regex) {
        compiledRules.push({ rule, regex });
      }
    }

    return compiledRules;
  }

  private compileRulePattern(rule: PolicyRule, diagnostics: string[]): RegExp | undefined {
    if (rule.pattern instanceof RegExp) {
      return rule.pattern;
    }

    if (rule.pattern.length > MAX_PATTERN_LENGTH) {
      diagnostics.push(`Rule ${rule.id} skipped because its pattern is too long.`);
      return undefined;
    }

    let pattern = rule.pattern;
    let flags = "";

    if (pattern.startsWith("(?i)")) {
      pattern = pattern.slice(4);
      flags = "i";
    }

    try {
      return new RegExp(pattern, flags);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown regex error";
      diagnostics.push(`Rule ${rule.id} skipped because its pattern is invalid: ${message}`);
      return undefined;
    }
  }
}
