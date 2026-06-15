# Policy Adapters Plan

Gatekeeper-MCP starts with built-in and markdown-backed rules. Enterprise environments often need policy interoperability.

## OPA/Rego adapter

Purpose:

- Let teams express guardrails using established policy-as-code workflows.
- Evaluate diff metadata and extracted additions as Rego input.

Example input shape:

```json
{
  "filePath": "src/api/users.ts",
  "language": "typescript",
  "additions": [
    {
      "lineNumber": 12,
      "content": "const response = await fetch('/api/users');"
    }
  ]
}
```

## AWS Cedar adapter

Purpose:

- Represent agent actions, repository resources, and policy decisions using an authorization-style model.
- Enable future enterprise integration with access-control patterns.

## Design principle

Adapters should be optional and must not make the core MCP server heavy for local users.
