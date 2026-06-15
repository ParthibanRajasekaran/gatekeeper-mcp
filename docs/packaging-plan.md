# Packaging Plan

## npm package target

Package name:

```text
gatekeeper-mcp
```

## Pre-publish checks

```bash
npm install
npm run typecheck
npm test
npm run build
npm pack --dry-run
```

## Required before publish

- Confirm CI is green.
- Add package-lock.json.
- Confirm `bin.gatekeeper-mcp` points to `dist/index.js`.
- Add a release tag.
- Add README install instructions.

## Future command

```bash
npx -y gatekeeper-mcp
```
