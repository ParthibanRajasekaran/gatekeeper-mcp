# OpenTelemetry Plan

Gatekeeper-MCP should eventually provide optional observability for enterprise teams.

## Trace lifecycle

- MCP tool request received.
- Input validation completed.
- Path confinement completed.
- Policy loading completed.
- Diff parsing completed.
- Rule evaluation completed.
- Audit response generated.

## Proposed span attributes

- `gatekeeper.workspace.hash`
- `gatekeeper.file.extension`
- `gatekeeper.language`
- `gatekeeper.rules.count`
- `gatekeeper.violations.count`
- `gatekeeper.cache.hit`

## Privacy guidance

Do not export raw prompts, raw diffs, secrets, or source code by default.
