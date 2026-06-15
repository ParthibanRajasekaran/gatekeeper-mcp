# Article Outline

## Working title

AI Coding Agents Need Security Guardrails Before Commit, Not After CI

## Thesis

AI-assisted development changes the timing of software risk. When agents generate code rapidly, policy enforcement must move closer to the generation loop rather than waiting for CI or human review.

## Outline

1. The new risk surface created by AI coding agents.
2. Why CI is necessary but too late for agentic workflows.
3. Why MCP creates a new security interception layer.
4. How Gatekeeper-MCP audits diffs before commit.
5. Turning SECURITY.md and ARCHITECTURE.md into executable policy.
6. Threat modelling MCP tool inputs.
7. What v1 catches and what remains out of scope.
8. Roadmap: OPA, Cedar, AST, OpenTelemetry, and PR checks.
9. Call for feedback from AI infrastructure and platform engineering teams.

## Evidence links to include

- GitHub repository.
- README architecture diagram.
- SECURITY.md threat model.
- MCP inspector demo guide.
- CI and CodeQL badges.
