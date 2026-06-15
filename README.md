# Gatekeeper-MCP

[![CI](https://github.com/ParthibanRajasekaran/gatekeeper-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/ParthibanRajasekaran/gatekeeper-mcp/actions/workflows/ci.yml)

Gatekeeper-MCP audits AI-generated code before it lands in your repo.

It turns existing repository policy documents such as `.github/SECURITY.md` and `.github/ARCHITECTURE.md` into live Model Context Protocol guardrails for AI coding assistants.

```text
[Gatekeeper] Code compliant with SOC2 policies. Safe to commit.

Audit Results: PASS
Violations: 0
```

## Why this exists

AI coding assistants can generate changes quickly, but they often do not know your company's security, tenancy, observability, or architecture rules. Traditional CI checks catch issues after code is already written. Gatekeeper-MCP shifts those checks earlier by auditing generated diffs before commit.

## 60 second quickstart

```bash
npm install
npm test
npm run build
npm run dev
```

Future package target:

```bash
npx -y gatekeeper-mcp
```

## Claude Desktop configuration

```json
{
  "mcpServers": {
    "gatekeeper-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/gatekeeper-mcp/dist/src/index.js"],
      "env": {
        "GATEKEEPER_WORKSPACE": "/absolute/path/to/your/repo"
      }
    }
  }
}
```

## MCP tool

Gatekeeper exposes one MCP tool:

```text
gatekeeper_audit_diff
```

Input:

```json
{
  "filePath": "src/api/users.ts",
  "language": "typescript",
  "diffString": "@@ -1,1 +1,2 @@\n+const response = await fetch(\"/api/users\");"
}
```

Output:

```text
[Gatekeeper] Compliance check failed.

Audit Results: FAIL
Violations: 1

Rule ARCH-001: No direct fetch
File: src/api/users.ts
Line: 1
Severity: error
Issue: Direct global fetch calls bypass approved HTTP client policies such as auth headers, tracing, retries, and error handling.
Offending code:
+const response = await fetch("/api/users");
Suggested remediation:
import { httpClient } from "@/lib/httpClient";

const response = await httpClient.get("/api/resource");
```

## Built-in guardrails

Gatekeeper-MCP ships with three starter rules:

| Rule | Purpose |
| --- | --- |
| `ARCH-001` | Blocks direct global `fetch()` in TypeScript and JavaScript |
| `SEC-001` | Blocks likely hardcoded secrets |
| `DATA-001` | Blocks raw `SELECT * FROM users` queries without tenant filtering |

## Markdown policy rules

Add structured rules to `.github/SECURITY.md` or `.github/ARCHITECTURE.md`:

````md
## Rule ARCH-001: No direct fetch

Severity: error
Languages: typescript,javascript
Pattern: \bfetch\s*\(

Description:
Direct global fetch calls bypass approved HTTP client policies.

Remediation:
Use the approved HTTP client.

```ts
import { httpClient } from "@/lib/httpClient";

const response = await httpClient.get("/api/resource");
```
````

Free-form markdown is ignored safely. Structured markdown overrides built-in rules by matching rule ID.

## Architecture

```text
Claude or MCP Client
        |
        | gatekeeper_audit_diff
        v
src/tools/auditDiff.ts
        |
        v
PolicyDiscovery + MarkdownPolicyParser
        |
        v
RuleCompiler
        |
        v
DiffParser + DiffAnalyzer
        |
        v
MCP-safe audit response
```

## Security posture

Gatekeeper-MCP v1 is intentionally conservative:

- It analyses diffs, not full repositories.
- It inspects only added lines.
- It never executes user code.
- It resolves policy files inside a workspace root.
- It logs diagnostics to stderr instead of stdout.
- It fails open with diagnostics when policy files cannot be parsed.

## Local development

```bash
npm install
npm run typecheck
npm test
npm run build
```

## Roadmap

- YAML override profile via `.github/gatekeeper.yml`
- Compiled rule cache
- Safer regex validation and timeout strategy
- AST-backed rules for TypeScript, Python, and Go
- CLI wrapper with screenshot-friendly terminal output
- GitHub Action for pull request checks
- Benchmark suite
- Demo GIF and project website

## Positioning

Gatekeeper-MCP is an open-source AI governance experiment for enterprise engineering teams adopting AI coding assistants. It explores a shift-left model where security and architecture policy can guide generated code before it is committed.
