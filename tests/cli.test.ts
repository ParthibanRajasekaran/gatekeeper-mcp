import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { runCli } from "../src/cli.js";

async function createWorkspace(): Promise<string> {
  return mkdtemp(path.join(tmpdir(), "gatekeeper-cli-"));
}

async function writeWorkspacePolicy(workspaceRoot: string): Promise<void> {
  await mkdir(path.join(workspaceRoot, ".github"), { recursive: true });
  await writeFile(
    path.join(workspaceRoot, ".github", "ARCHITECTURE.md"),
    [
      "## Rule ARCH-001: No direct fetch",
      "Severity: error",
      "Languages: typescript,javascript",
      "Pattern: \\bfetch\\s*\\(",
      "Description:",
      "Use the approved HTTP client."
    ].join("\n")
  );
}

describe("Gatekeeper CLI", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns non-zero for a blocking audit violation", async () => {
    const workspaceRoot = await createWorkspace();
    await writeWorkspacePolicy(workspaceRoot);
    await mkdir(path.join(workspaceRoot, "demo"), { recursive: true });
    await writeFile(
      path.join(workspaceRoot, "demo", "failing.patch"),
      `@@ -1,1 +1,2 @@\n+const response = await fetch("/api/users");\n`
    );

    const stdout = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const stderr = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const exitCode = await runCli([
      "audit",
      "--workspace",
      workspaceRoot,
      "--diff",
      "demo/failing.patch",
      "--file",
      "src/api/users.ts",
      "--language",
      "typescript"
    ]);

    expect(exitCode).toBe(1);
    expect(stdout.mock.calls.join("\n")).toContain("Audit Results: FAIL");
    expect(stdout.mock.calls.join("\n")).toContain("ARCH-001");
    expect(stderr).not.toHaveBeenCalled();
  });

  it("returns zero for a compliant audit", async () => {
    const workspaceRoot = await createWorkspace();
    await writeWorkspacePolicy(workspaceRoot);
    await mkdir(path.join(workspaceRoot, "demo"), { recursive: true });
    await writeFile(
      path.join(workspaceRoot, "demo", "passing.patch"),
      `@@ -1,1 +1,2 @@\n+const response = await httpClient.get("/api/users");\n`
    );

    const stdout = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const stderr = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const exitCode = await runCli([
      "audit",
      "--workspace",
      workspaceRoot,
      "--diff",
      "demo/passing.patch",
      "--file",
      "src/api/users.ts",
      "--language",
      "typescript"
    ]);

    expect(exitCode).toBe(0);
    expect(stdout.mock.calls.join("\n")).toContain("Audit Results: PASS");
    expect(stderr).not.toHaveBeenCalled();
  });

  it("returns usage error for missing required arguments", async () => {
    const stdout = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const stderr = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const exitCode = await runCli(["audit"]);

    expect(exitCode).toBe(2);
    expect(stderr.mock.calls.join("\n")).toContain("--diff and --file are required");
    expect(stdout).not.toHaveBeenCalled();
  });
});
