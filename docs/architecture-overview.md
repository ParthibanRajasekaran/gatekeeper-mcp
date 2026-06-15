# Architecture Overview

Gatekeeper-MCP keeps protocol handling separate from policy loading and diff analysis.

## Runtime flow

1. MCP client calls `gatekeeper_audit_diff`.
2. Input is validated with Zod.
3. File path is checked against the workspace root.
4. Policies are loaded from cache or parsed from repository docs.
5. Added diff lines are extracted.
6. Active rules are evaluated.
7. The tool returns a clean MCP text response.

## Design principles

- Keep MCP transport code thin.
- Keep business diagnostics out of stdout.
- Treat all MCP tool arguments as untrusted.
- Prefer deterministic local analysis for v1.
- Defer heavier AST and policy-engine integrations to roadmap phases.
