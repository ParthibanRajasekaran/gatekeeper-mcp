# Gatekeeper Security Policies

These example policies demonstrate how repository documentation can become executable AI coding guardrails.

## Rule SEC-001: No hardcoded secrets

Severity: error
Languages: typescript,javascript,python,go,generic
Pattern: (?i)(api[_-]?key|secret|token|password)\s*[:=]\s*[\"'][^\"']{8,}[\"']

Description:
Hardcoded secrets must not be committed. Use environment variables or an approved secret manager.

Remediation:
Use environment variables or your organisation's approved secrets provider.

```ts
const apiKey = process.env.API_KEY;
```
