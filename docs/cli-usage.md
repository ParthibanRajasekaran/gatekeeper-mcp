# CLI Usage

Gatekeeper-MCP can be used as a command-line audit tool as well as an MCP server.

## Build first

```bash
npm install
npm run build
```

## Audit a failing diff

```bash
node dist/cli.js audit \
  --diff demo/failing-diff.patch \
  --file src/api/users.ts \
  --language typescript
```

Expected behaviour:

```text
Audit Results: FAIL
Rule ARCH-001: No direct fetch
```

The CLI exits with code `1` when blocking policy violations are found.

## Audit a passing diff

```bash
node dist/cli.js audit \
  --diff demo/passing-diff.patch \
  --file src/api/users.ts \
  --language typescript
```

Expected behaviour:

```text
Audit Results: PASS
```

The CLI exits with code `0` when the audit is compliant.

## Workspace root

By default, Gatekeeper uses the current working directory as the workspace root. You can override it:

```bash
node dist/cli.js audit \
  --workspace /absolute/path/to/repo \
  --diff demo/failing-diff.patch \
  --file src/api/users.ts \
  --language typescript
```

## Future npm usage

After publishing:

```bash
npx -y gatekeeper-mcp audit \
  --diff demo/failing-diff.patch \
  --file src/api/users.ts \
  --language typescript
```

## Supported languages

- `typescript`
- `javascript`
- `python`
- `go`
- `generic`
