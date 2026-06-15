# Pull Request Checks Plan

Gatekeeper-MCP should support a GitHub Action mode after the local MCP MVP is stable.

## Goal

Audit pull request diffs against the same policy rules used by the local MCP server.

## Proposed features

- Read changed files from a pull request.
- Convert changed files into unified diff payloads.
- Run Gatekeeper rules.
- Emit a markdown summary.
- Optionally emit SARIF.
- Optionally annotate pull requests.

## Value

This allows teams to use the same guardrails locally with AI coding agents and centrally in code review.
