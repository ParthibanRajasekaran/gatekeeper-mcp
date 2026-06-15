# Tech Nation Evidence Narrative

This document captures the leadership and innovation narrative behind Gatekeeper-MCP.

## Problem identified

AI coding agents can accelerate software delivery, but they can also generate changes without awareness of organisation-specific security, architecture, tenancy, and compliance standards. Conventional CI checks often detect violations after the code has already been produced.

## Innovation hypothesis

MCP creates a new intervention point for AI-assisted software delivery. Instead of waiting for CI, a policy-aware MCP server can audit generated diffs before commit and return actionable remediation to the AI client.

## Technical contribution

Gatekeeper-MCP demonstrates:

- MCP-native policy enforcement.
- Markdown-first policy-as-code from existing repository documentation.
- Workspace path confinement for untrusted tool inputs.
- Diff-level security and architecture analysis.
- MCP-safe stdio design.
- Cached policy loading for repeated agent calls.
- A roadmap toward OPA/Rego, AWS Cedar, AST-backed rules, and OpenTelemetry.

## Evidence signals to build

- Public GitHub repository.
- CI and security workflow badges.
- Architecture and sequence diagrams.
- STRIDE threat model.
- Local MCP inspector smoke test.
- Technical article explaining MCP security risks.
- Community feedback through issues, stars, forks, and PRs.
- Package release through npm.

## Suggested article title

AI Coding Agents Need Security Guardrails Before Commit, Not After CI
