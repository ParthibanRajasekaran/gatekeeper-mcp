# Benchmark Plan

Gatekeeper-MCP should eventually publish simple performance numbers so enterprise users can reason about latency.

## Metrics

- Policy load time.
- Cached policy load time.
- Diff parsing time.
- Rule evaluation time.
- End-to-end audit latency.

## Target

The local MVP should aim for sub-100ms evaluation for common small diffs after policy cache warm-up.

## Future script

```bash
npm run benchmark
```

## Output format

```text
Policy cache: warm
Diff lines: 120
Rules evaluated: 12
Violations: 1
Duration: 18ms
```
