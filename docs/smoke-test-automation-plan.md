# Smoke Test Automation Plan

The current smoke test is documented for the MCP inspector. The next step is automation.

## Goal

Run a scripted audit against `demo/failing-diff.patch` and `demo/passing-diff.patch` without manual inspector interaction.

## Proposed approach

- Build the project.
- Start the MCP server as a child process.
- Send JSON-RPC initialize request.
- Call `gatekeeper_audit_diff` with the failing diff.
- Assert a failed audit.
- Call `gatekeeper_audit_diff` with the passing diff.
- Assert a passing audit.
- Shut down the child process cleanly.

## Why this matters

This provides confidence that the MCP stdio transport, tool registration, input validation, and policy engine work together.
