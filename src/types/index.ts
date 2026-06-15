import { z } from "zod";

export type Severity = "info" | "warn" | "error";

export type SupportedLanguage =
  | "typescript"
  | "javascript"
  | "python"
  | "go"
  | "generic";

export type RuleSource = "builtin" | "markdown" | "yaml";

export interface PolicyRule {
  id: string;
  name: string;
  source: RuleSource;
  pattern: RegExp | string;
  severity: Severity;
  description: string;
  remediationExample?: string;
  languages?: SupportedLanguage[];
  enabled: boolean;
}

export interface DiffPayload {
  filePath: string;
  diffString: string;
  language: SupportedLanguage;
}

export interface DiffAddition {
  filePath: string;
  lineNumber: number;
  content: string;
  raw: string;
}

export interface PolicyViolation {
  ruleId: string;
  ruleName: string;
  lineStart: number;
  lineEnd: number;
  severity: Severity;
  message: string;
  offendingCode: string;
  suggestedFix?: string;
}

export interface AuditResponse {
  isCompliant: boolean;
  violationsCount: number;
  violations: PolicyViolation[];
  summary: string;
  diagnostics: string[];
}

export const AuditDiffSchema = z.object({
  filePath: z
    .string()
    .min(1)
    .max(512)
    .describe("The relative target file path being modified."),
  diffString: z
    .string()
    .min(1)
    .max(1_000_000)
    .describe("The full unified diff string showing changes."),
  language: z
    .enum(["typescript", "javascript", "python", "go", "generic"])
    .default("generic")
});

export type AuditDiffInput = z.infer<typeof AuditDiffSchema>;
