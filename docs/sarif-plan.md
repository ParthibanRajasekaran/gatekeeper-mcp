# SARIF Plan

SARIF output will make Gatekeeper-MCP compatible with code scanning workflows.

## Goal

Represent policy violations as code scanning findings.

## Initial fields

- Rule ID.
- Rule name.
- Severity.
- File path.
- Line number.
- Message.
- Suggested remediation.

## Use cases

- GitHub Advanced Security code scanning.
- Pull request annotations.
- Security evidence for engineering governance.
