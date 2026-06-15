# Questions

## Is this a replacement for CI?

No. It catches policy violations earlier while CI remains the final enforcement layer.

## Does it execute generated code?

No. The MVP analyses diffs and policy files only.

## Why MCP?

MCP gives AI coding clients a standard way to call local tools. Gatekeeper-MCP uses that point to audit generated code before it reaches the repository.

## Why markdown policies?

Many teams already document standards in `SECURITY.md` and `ARCHITECTURE.md`. Markdown-first adoption keeps the initial workflow lightweight.

## Will it support external policy engines?

Yes. Adapters are planned after the MVP is stable.
