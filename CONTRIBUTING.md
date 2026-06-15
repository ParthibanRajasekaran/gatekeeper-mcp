# Contributing

Thank you for considering a contribution to Gatekeeper-MCP.

## Development setup

```bash
npm install
npm run typecheck
npm test
npm run build
```

## Contribution areas

Good first areas:

- New built-in guardrail rules.
- Better markdown policy parsing tests.
- MCP inspector smoke-test automation.
- Documentation improvements.
- Benchmarking policy evaluation latency.

Advanced areas:

- TypeScript AST-backed rules.
- OPA/Rego adapter.
- AWS Cedar adapter.
- OpenTelemetry instrumentation.
- GitHub Action mode.

## Pull request expectations

- Keep protocol code separate from policy logic.
- Add tests for new behaviour.
- Do not write runtime diagnostics to stdout.
- Treat tool inputs as untrusted.
- Avoid heavy dependencies unless the design case is clear.
