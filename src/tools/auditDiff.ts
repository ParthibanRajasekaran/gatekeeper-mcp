import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CachedPolicyParser } from "../services/cachedPolicyParser.js";
import { DiffAnalyzer } from "../services/diffAnalyzer.js";
import { sanitizeWorkspacePath } from "../services/pathSanitizer.js";
import { AuditDiffSchema, type AuditDiffInput, type AuditResponse } from "../types/index.js";

type ContentBlock = {
  type: "text";
  text: string;
};

type ToolResponse = {
  content: ContentBlock[];
  isError?: boolean;
};

type AuditDiffOptions = {
  workspaceRoot: string;
  policyParser?: CachedPolicyParser;
};

const defaultPolicyParser = new CachedPolicyParser();

export function registerAuditDiffTool(server: McpServer, options: AuditDiffOptions): void {
  server.registerTool(
    "gatekeeper_audit_diff",
    {
      title: "Gatekeeper Audit Diff",
      description:
        "Audits an AI-generated code patch against local security and architecture guardrails before commit.",
      inputSchema: AuditDiffSchema.shape
    },
    async (input) => createAuditDiffResponse(input, options)
  );
}

export async function createAuditDiffResponse(
  input: unknown,
  options: AuditDiffOptions
): Promise<ToolResponse> {
  const parsed = AuditDiffSchema.safeParse(input);

  if (!parsed.success) {
    return {
      content: [
        {
          type: "text",
          text: `[Gatekeeper] Invalid audit request.\n\n${parsed.error.message}`
        }
      ],
      isError: true
    };
  }

  try {
    sanitizeWorkspacePath(options.workspaceRoot, parsed.data.filePath);
    const auditResponse = await runAudit(parsed.data, options);
    return {
      content: [
        {
          type: "text",
          text: formatAuditResponse(parsed.data.filePath, auditResponse)
        }
      ]
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Gatekeeper] Audit failure: ${message}`);

    return {
      content: [
        {
          type: "text",
          text: `[Gatekeeper] Failed to complete compliance validation.\n\n${message}`
        }
      ],
      isError: true
    };
  }
}

async function runAudit(input: AuditDiffInput, options: AuditDiffOptions): Promise<AuditResponse> {
  const analyzer = new DiffAnalyzer();
  const rules = await (options.policyParser ?? defaultPolicyParser).loadWorkspacePolicies(
    options.workspaceRoot
  );

  return analyzer.runRules(input, rules);
}

function formatAuditResponse(filePath: string, auditResponse: AuditResponse): string {
  if (auditResponse.isCompliant) {
    const diagnostics = formatDiagnostics(auditResponse.diagnostics);
    return [
      "[Gatekeeper] Code compliant with SOC2 policies. Safe to commit.",
      "",
      "Audit Results: PASS",
      `Violations: ${auditResponse.violationsCount}`,
      diagnostics
    ]
      .filter(Boolean)
      .join("\n");
  }

  const sections = [
    "[Gatekeeper] Compliance check failed.",
    "",
    "Audit Results: FAIL",
    `Violations: ${auditResponse.violationsCount}`,
    ""
  ];

  for (const violation of auditResponse.violations) {
    sections.push(`Rule ${violation.ruleId}: ${violation.ruleName}`);
    sections.push(`File: ${filePath}`);
    sections.push(`Line: ${violation.lineStart}`);
    sections.push(`Severity: ${violation.severity}`);
    sections.push(`Issue: ${violation.message}`);
    sections.push("Offending code:");
    sections.push(violation.offendingCode);

    if (violation.suggestedFix) {
      sections.push("Suggested remediation:");
      sections.push(violation.suggestedFix);
    }

    sections.push("");
  }

  const diagnostics = formatDiagnostics(auditResponse.diagnostics);
  if (diagnostics) {
    sections.push(diagnostics);
  }

  return sections.join("\n").trimEnd();
}

function formatDiagnostics(diagnostics: string[]): string {
  if (diagnostics.length === 0) {
    return "";
  }

  return ["Diagnostics:", ...diagnostics.map((diagnostic) => `- ${diagnostic}`)].join("\n");
}
