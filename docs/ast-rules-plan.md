# AST Rules Plan

The current MVP uses deterministic line-based rules for speed and simplicity. AST-backed rules will improve precision for complex architectural checks.

## Initial TypeScript AST candidates

- Detect direct database client imports outside approved repository layers.
- Detect `eval` and `new Function` with stronger context.
- Detect direct global `fetch` calls with import and scope awareness.
- Detect architectural boundary violations between modules.

## Principles

- Keep AST parsing optional.
- Apply AST only to high-value rules.
- Keep regex rules as the fast default path.
- Benchmark AST overhead before enabling by default.
