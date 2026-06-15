# npm Release Readiness

This document tracks the steps needed before publishing Gatekeeper-MCP as a public package.

## Already prepared

- Package is public-ready with `private: false`.
- Package exposes CLI binary `gatekeeper-mcp`.
- Package exposes server binary `gatekeeper-mcp-server`.
- Package includes a `files` allowlist.
- Package has `prepublishOnly` validation.
- CI validates typecheck, tests, build, MCP smoke, and CLI smoke.

## Before first publish

1. Run the full local validation sequence.

```bash
npm install
npm run typecheck
npm test
npm run build
npm run smoke
npm run smoke:cli
npm run benchmark
```

2. Generate and commit `package-lock.json` from a local machine.

```bash
npm install
```

3. Pin `@modelcontextprotocol/sdk` to a known working version instead of `latest`.

4. Run package dry run.

```bash
npm pack --dry-run
```

5. Publish when the package contents are correct.

```bash
npm publish --access public
```

## Post-publish validation

```bash
npx -y gatekeeper-mcp audit \
  --diff demo/failing-diff.patch \
  --file src/api/users.ts \
  --language typescript
```

## Evidence value

A published package creates a stronger public adoption path for the project. It allows reviewers, engineers, and AI tooling communities to try Gatekeeper without cloning the repository.
