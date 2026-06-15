import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PolicyDiscovery } from "../src/services/policyDiscovery.js";

async function createWorkspace(): Promise<string> {
  return mkdtemp(path.join(tmpdir(), "gatekeeper-mcp-"));
}

describe("PolicyDiscovery", () => {
  it("discovers known readable policy files", async () => {
    const workspace = await createWorkspace();
    await mkdir(path.join(workspace, ".github"), { recursive: true });
    await writeFile(path.join(workspace, ".github", "SECURITY.md"), "# Security");

    const discovery = new PolicyDiscovery(workspace);
    const files = await discovery.discoverPolicyFiles();

    expect(files).toEqual([path.join(workspace, ".github", "SECURITY.md")]);
  });

  it("does not recursively scan directories", async () => {
    const workspace = await createWorkspace();
    await mkdir(path.join(workspace, "docs", "nested"), { recursive: true });
    await writeFile(path.join(workspace, "docs", "nested", "SECURITY.md"), "# Nested");

    const discovery = new PolicyDiscovery(workspace);
    const files = await discovery.discoverPolicyFiles();

    expect(files).toEqual([]);
  });

  it("skips unsafe traversal paths when custom paths are supplied", async () => {
    const workspace = await createWorkspace();
    const discovery = new PolicyDiscovery(workspace, ["../SECURITY.md"]);

    const files = await discovery.discoverPolicyFiles();

    expect(files).toEqual([]);
  });
});
