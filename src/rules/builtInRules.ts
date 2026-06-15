import type { PolicyRule } from "../types/index.js";

export const builtInRules: PolicyRule[] = [
  {
    id: "ARCH-001",
    name: "No direct fetch",
    source: "builtin",
    pattern: "\\bfetch\\s*\\(",
    severity: "error",
    description:
      "Direct global fetch calls bypass approved HTTP client policies such as auth headers, tracing, retries, and error handling.",
    remediationExample:
      'import { httpClient } from "@/lib/httpClient";\n\nconst response = await httpClient.get("/api/resource");',
    languages: ["typescript", "javascript"],
    enabled: true
  },
  {
    id: "SEC-001",
    name: "No hardcoded secrets",
    source: "builtin",
    pattern:
      "(?i)(api[_-]?key|secret|token|password)\\s*[:=]\\s*[\\\"'][^\\\"']{8,}[\\\"']",
    severity: "error",
    description:
      "Hardcoded secrets must not be committed. Use environment variables or an approved secret manager.",
    remediationExample: "const apiKey = process.env.API_KEY;",
    languages: ["typescript", "javascript", "python", "go", "generic"],
    enabled: true
  },
  {
    id: "DATA-001",
    name: "Tenant filter required for raw user queries",
    source: "builtin",
    pattern: "SELECT\\s+\\*\\s+FROM\\s+users(?![^;]*tenant_id)",
    severity: "error",
    description:
      "Raw user queries must include tenant filtering to prevent cross-tenant data exposure.",
    remediationExample:
      'await db.query("SELECT * FROM users WHERE tenant_id = ?", [tenantId]);',
    languages: ["typescript", "javascript", "python", "go", "generic"],
    enabled: true
  }
];
