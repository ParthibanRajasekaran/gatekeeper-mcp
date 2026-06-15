# Validation Status

## Current status

The repository has been prepared for local validation and CI validation.

## Commands to run locally

```bash
npm install
npm run typecheck
npm test
npm run build
npx @modelcontextprotocol/inspector node dist/index.js
```

## Current limitation

The ChatGPT sandbox used to prepare this repository cannot reach GitHub directly via `git clone`, so local execution must be performed on a developer machine or by GitHub Actions.

## Validation goals

- TypeScript build passes.
- Vitest test suite passes.
- MCP inspector starts the server.
- `gatekeeper_audit_diff` returns FAIL for `demo/failing-diff.patch`.
- `gatekeeper_audit_diff` returns PASS for `demo/passing-diff.patch`.
