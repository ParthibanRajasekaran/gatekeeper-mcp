# Quality Strategy

Gatekeeper-MCP should demonstrate quality engineering discipline.

## Current quality gates

- TypeScript strict mode.
- Vitest unit tests.
- CI workflow.
- CodeQL workflow.
- npm audit workflow.

## Next quality gates

- MCP inspector smoke test automation.
- Benchmark test for policy evaluation latency.
- Pull request fixture tests.
- SARIF output validation.
- Mutation testing spike for core rule engine.

## Test pyramid

- Unit tests for parsers and analyzers.
- Integration tests for MCP tool response shape.
- Smoke tests for stdio server behaviour.
- End-to-end tests for demo patches.
