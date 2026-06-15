import { describe, expect, it } from "vitest";
import { builtInRules } from "../src/rules/builtInRules.js";
import { DiffAnalyzer } from "../src/services/diffAnalyzer.js";
import type { PolicyRule } from "../src/types/index.js";

const analyzer = new DiffAnalyzer();

describe("DiffAnalyzer", () => {
  it("returns compliant when no added lines violate policies", async () => {
    const result = await analyzer.runRules(
      {
        filePath: "src/api.ts",
        language: "typescript",
        diffString: `@@ -1,1 +1,2 @@
 const ok = true;
+const response = await httpClient.get("/api/users");
`
      },
      builtInRules
    );

    expect(result.isCompliant).toBe(true);
    expect(result.violationsCount).toBe(0);
  });

  it("detects direct global fetch usage", async () => {
    const result = await analyzer.runRules(
      {
        filePath: "src/api.ts",
        language: "typescript",
        diffString: `@@ -1,1 +1,2 @@
+const response = await fetch("/api/users");
`
      },
      builtInRules
    );

    expect(result.isCompliant).toBe(false);
    expect(result.violations[0]?.ruleId).toBe("ARCH-001");
    expect(result.violations[0]?.suggestedFix).toContain("httpClient");
  });

  it("detects hardcoded secrets case-insensitively", async () => {
    const result = await analyzer.runRules(
      {
        filePath: "src/config.ts",
        language: "typescript",
        diffString: `@@ -1,1 +1,2 @@
+const AI_API_KEY = "sk-live-123456789";
`
      },
      builtInRules
    );

    expect(result.isCompliant).toBe(false);
    expect(result.violations.map((violation) => violation.ruleId)).toContain("SEC-001");
  });

  it("detects raw user queries without tenant filtering", async () => {
    const result = await analyzer.runRules(
      {
        filePath: "src/users.ts",
        language: "typescript",
        diffString: `@@ -1,1 +1,2 @@
+await db.query("SELECT * FROM users");
`
      },
      builtInRules
    );

    expect(result.isCompliant).toBe(false);
    expect(result.violations.map((violation) => violation.ruleId)).toContain("DATA-001");
  });

  it("does not flag raw user queries with tenant filtering", async () => {
    const result = await analyzer.runRules(
      {
        filePath: "src/users.ts",
        language: "typescript",
        diffString: `@@ -1,1 +1,2 @@
+await db.query("SELECT * FROM users WHERE tenant_id = ?", [tenantId]);
`
      },
      builtInRules
    );

    expect(result.isCompliant).toBe(true);
  });

  it("filters rules by language", async () => {
    const result = await analyzer.runRules(
      {
        filePath: "main.go",
        language: "go",
        diffString: `@@ -1,1 +1,2 @@
+fetch("/api/users")
`
      },
      builtInRules
    );

    expect(result.violations.map((violation) => violation.ruleId)).not.toContain("ARCH-001");
  });

  it("skips invalid regex rules with diagnostics", async () => {
    const invalidRule: PolicyRule = {
      id: "BAD-001",
      name: "Invalid regex",
      source: "markdown",
      pattern: "(",
      severity: "error",
      description: "Bad rule",
      enabled: true
    };

    const result = await analyzer.runRules(
      {
        filePath: "src/index.ts",
        language: "typescript",
        diffString: `@@ -1,1 +1,2 @@
+const value = true;
`
      },
      [invalidRule]
    );

    expect(result.isCompliant).toBe(true);
    expect(result.diagnostics[0]).toContain("BAD-001");
  });
});
