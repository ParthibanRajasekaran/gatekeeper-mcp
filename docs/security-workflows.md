# Security Workflows

Gatekeeper-MCP uses lightweight security workflows to keep the public repository credible.

## CodeQL

Runs static analysis for JavaScript and TypeScript.

## npm audit

Checks dependency vulnerabilities at high severity and above.

## Dependabot

Creates weekly dependency update pull requests.

## Future additions

- Dependency review workflow for pull requests.
- Container image scanning if Docker packaging is added.
- SARIF output validation once PR mode exists.
