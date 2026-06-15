import type { PolicyRule } from "../types/index.js";

export class RuleCompiler {
  compile(builtInRules: PolicyRule[], markdownRules: PolicyRule[]): PolicyRule[] {
    const byId = new Map<string, PolicyRule>();

    for (const rule of builtInRules) {
      if (this.isRuleUsable(rule)) {
        byId.set(rule.id, rule);
      } else {
        console.error(`[Gatekeeper] Ignoring malformed built-in rule: ${rule.id}`);
      }
    }

    for (const rule of markdownRules) {
      if (this.isRuleUsable(rule)) {
        byId.set(rule.id, rule);
      } else {
        console.error(`[Gatekeeper] Ignoring malformed markdown rule: ${rule.id}`);
      }
    }

    return [...byId.values()].sort((first, second) => first.id.localeCompare(second.id));
  }

  private isRuleUsable(rule: PolicyRule): boolean {
    return Boolean(
      rule.id.trim() &&
        rule.name.trim() &&
        rule.description.trim() &&
        rule.severity &&
        rule.pattern
    );
  }
}
