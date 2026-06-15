import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CachedPolicyParser } from "../src/services/cachedPolicyParser.js";

async function createWorkspace(): Promise<string> {
  return mkdtemp(path.join(tmpdir(), "gatekeeper-cache-"));
}

describe("CachedPolicyParser", () => {
  it("loads built-in rules when no markdown policies exist", async () => {
    const parser = new CachedPolicyParser();
    const rules = await parser.loadWorkspacePolicies(await createWorkspace());

    expect(rules.map((rule) => rule.id)).toContain("ARCH-001");
  });

  it("loads markdown rules from workspace policy files", async () => {
    const workspace = await createWorkspace();
    await mkdir(path.join(workspace, ".github"), { recursive: true });
    await writeFile(
      path.join(workspace, ".github", "SECURITY.md"),
      [
        "## Rule CUSTOM-999: No dynamic execution",
        "Severity: error",
        "Pattern: dynamicExecution",
        "Description:",
        "Do not execute dynamic code."
      ].join("\n")
    );

    const parser = new CachedPolicyParser();
    const rules = await parser.loadWorkspacePolicies(workspace);

    expect(rules.map((rule) => rule.id)).toContain("CUSTOM-999");
  });
});
