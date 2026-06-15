import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createAuditDiffResponse } from "../src/tools/auditDiff.js";

async function createWorkspace(): Promise<string> {
  return mkdtemp(path.join(tmpdir(), "gatekeeper-mcp-tool-"));
}

describe("createAuditDiffResponse", () => {
  it("returns a pass response for compliant code", async () => {
    const workspaceRoot = await createWorkspace();
    const response = await createAuditDiffResponse(
      {
        filePath: "src/api.ts",
        language: "typescript",
        diffString: `@@ -1,1 +1,2 @@
+const response = await httpClient.get("/api/users");
`
      },
      { workspaceRoot }
    );

    expect(response.isError).toBeUndefined();
    expect(response.content[0]?.text).toContain("Audit Results: PASS");
  });

  it("returns a fail response with remediation for direct fetch", async () => {
    const workspaceRoot = await createWorkspace();
    const response = await createAuditDiffResponse(
      {
        filePath: "src/api.ts",
        language: "typescript",
        diffString: `@@ -1,1 +1,2 @@
+const response = await fetch("/api/users");
`
      },
      { workspaceRoot }
    );

    expect(response.content[0]?.text).toContain("Audit Results: FAIL");
    expect(response.content[0]?.text).toContain("Rule ARCH-001");
    expect(response.content[0]?.text).toContain("httpClient");
  });

  it("loads structured markdown policy files from the workspace", async () => {
    const workspaceRoot = await createWorkspace();
    await mkdir(path.join(workspaceRoot, ".github"), { recursive: true });
    await writeFile(
      path.join(workspaceRoot, ".github", "SECURITY.md"),
      [
        "## Rule SEC-999: No eval",
        "Severity: error",
        "Languages: typescript,javascript",
        "Pattern: \\beval\\s*\\(",
        "Description:",
        "Do not execute dynamic code."
      ].join("\n")
    );

    const response = await createAuditDiffResponse(
      {
        filePath: "src/runtime.ts",
        language: "typescript",
        diffString: `@@ -1,1 +1,2 @@
+eval(userInput);
`
      },
      { workspaceRoot }
    );

    expect(response.content[0]?.text).toContain("Rule SEC-999");
  });

  it("returns an MCP error response for invalid input", async () => {
    const workspaceRoot = await createWorkspace();
    const response = await createAuditDiffResponse(
      {
        filePath: "",
        language: "typescript",
        diffString: ""
      },
      { workspaceRoot }
    );

    expect(response.isError).toBe(true);
    expect(response.content[0]?.text).toContain("Invalid audit request");
  });
});
