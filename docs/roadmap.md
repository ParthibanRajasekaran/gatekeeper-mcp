# Roadmap

Gatekeeper-MCP is being developed as a practical AI governance layer for MCP-compatible coding agents.

## Phase 1: Stable MVP

- CI, typecheck, tests, and build pass consistently.
- MCP inspector smoke test documented.
- Built-in rules for direct fetch, hardcoded secrets, and tenant filtering.
- Markdown policy parsing from repository documentation.
- Workspace path confinement.
- Cached policy loading.

## Phase 2: Pull request enforcement

- GitHub Action mode.
- PR annotations for detected violations.
- SARIF output for security tooling integration.
- Demo repository with before and after examples.

## Phase 3: Enterprise policy interoperability

- OPA/Rego adapter.
- AWS Cedar adapter.
- Versioned policy profiles.
- Rule severity thresholds by environment.

## Phase 4: Deeper static analysis

- TypeScript AST-backed architecture rules.
- SQL AST tenant-isolation checks.
- Safer regex validation and benchmarked execution limits.

## Phase 5: Observability and adoption

- OpenTelemetry spans for audit lifecycle tracing.
- Benchmark dashboard.
- npm package release.
- Public technical article and demo GIF.
