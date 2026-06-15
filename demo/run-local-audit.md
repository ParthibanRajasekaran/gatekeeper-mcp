# Local Gatekeeper-MCP Smoke Test

This guide validates the MVP end to end after cloning the repository.

## 1. Build the server

```bash
npm install
npm run typecheck
npm test
npm run build
```

## 2. Start the MCP inspector

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## 3. Call the audit tool

Use the tool:

```text
gatekeeper_audit_diff
```

With this payload for a failing audit:

```json
{
  "filePath": "src/api/users.ts",
  "language": "typescript",
  "diffString": "diff --git a/src/api/users.ts b/src/api/users.ts\nindex 1111111..2222222 100644\n--- a/src/api/users.ts\n+++ b/src/api/users.ts\n@@ -1,3 +1,4 @@\n export async function getUsers() {\n+  const response = await fetch(\"/api/users\");\n   return response.json();\n }"
}
```

Expected result:

```text
Audit Results: FAIL
Rule ARCH-001: No direct fetch
```

Use this payload for a passing audit:

```json
{
  "filePath": "src/api/users.ts",
  "language": "typescript",
  "diffString": "diff --git a/src/api/users.ts b/src/api/users.ts\nindex 1111111..2222222 100644\n--- a/src/api/users.ts\n+++ b/src/api/users.ts\n@@ -1,3 +1,5 @@\n+import { httpClient } from \"@/lib/httpClient\";\n+\n export async function getUsers() {\n+  const response = await httpClient.get(\"/api/users\");\n   return response.json();\n }"
}
```

Expected result:

```text
Audit Results: PASS
Violations: 0
```

## Notes

- MCP protocol traffic uses stdout.
- Gatekeeper diagnostics intentionally use stderr.
- Do not add `console.log` to runtime paths.
