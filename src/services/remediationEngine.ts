import type { PolicyRule } from "../types/index.js";

export function buildViolationMessage(rule: PolicyRule): string {
  return rule.description;
}

export function getSuggestedFix(rule: PolicyRule): string | undefined {
  if (!rule.remediationExample?.trim()) {
    return undefined;
  }

  return rule.remediationExample;
}
