import path from "node:path";
import { describe, expect, it } from "vitest";
import { sanitizeWorkspacePath } from "../src/services/pathSanitizer.js";

describe("sanitizeWorkspacePath", () => {
  it("resolves safe relative paths inside the workspace", () => {
    const root = path.resolve("/tmp/workspace");

    expect(sanitizeWorkspacePath(root, "src/index.ts")).toBe(
      path.join(root, "src", "index.ts")
    );
  });

  it("allows the workspace root itself", () => {
    const root = path.resolve("/tmp/workspace");

    expect(sanitizeWorkspacePath(root, ".")).toBe(root);
  });

  it("rejects parent directory traversal", () => {
    const root = path.resolve("/tmp/workspace");

    expect(() => sanitizeWorkspacePath(root, "../secret.txt")).toThrow(
      "Security Exception"
    );
  });

  it("rejects absolute paths outside the workspace", () => {
    const root = path.resolve("/tmp/workspace");

    expect(() => sanitizeWorkspacePath(root, "/etc/passwd")).toThrow(
      "Security Exception"
    );
  });
});
