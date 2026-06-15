# Gatekeeper Architecture Policies

These example policies encode architectural expectations for AI-generated changes.

## Rule ARCH-001: No direct fetch

Severity: error
Languages: typescript,javascript
Pattern: \bfetch\s*\(

Description:
Direct global fetch calls bypass approved HTTP client policies such as auth headers, tracing, retries, and error handling.

Remediation:
Use the approved HTTP client wrapper.

```ts
import { httpClient } from "@/lib/httpClient";

const response = await httpClient.get("/api/resource");
```

## Rule DATA-001: Tenant filter required for raw user queries

Severity: error
Languages: typescript,javascript,python,go,generic
Pattern: SELECT\s+\*\s+FROM\s+users(?![^;]*tenant_id)

Description:
Raw user queries must include tenant filtering to prevent cross-tenant data exposure.

Remediation:
Add tenant scoping to the query.

```ts
await db.query("SELECT * FROM users WHERE tenant_id = ?", [tenantId]);
```
