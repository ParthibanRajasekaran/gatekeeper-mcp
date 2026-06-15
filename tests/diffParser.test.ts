import { describe, expect, it } from "vitest";
import { extractDiffAdditions } from "../src/services/diffParser.js";

describe("extractDiffAdditions", () => {
  it("extracts simple added lines with line numbers", () => {
    const diff = `diff --git a/src/api.ts b/src/api.ts
index 123..456 100644
--- a/src/api.ts
+++ b/src/api.ts
@@ -1,2 +1,3 @@
 const existing = true;
+const added = true;
 export { existing };
`;

    const additions = extractDiffAdditions("src/api.ts", diff);

    expect(additions).toEqual([
      {
        filePath: "src/api.ts",
        lineNumber: 2,
        content: "const added = true;",
        raw: "+const added = true;"
      }
    ]);
  });

  it("ignores +++ file headers", () => {
    const diff = `--- a/src/api.ts
+++ b/src/api.ts
@@ -0,0 +1,1 @@
+export const value = 1;
`;

    const additions = extractDiffAdditions("src/api.ts", diff);

    expect(additions).toHaveLength(1);
    expect(additions[0]?.content).toBe("export const value = 1;");
  });

  it("ignores deleted lines", () => {
    const diff = `@@ -1,2 +1,2 @@
-const oldValue = false;
+const newValue = true;
`;

    const additions = extractDiffAdditions("src/api.ts", diff);

    expect(additions).toHaveLength(1);
    expect(additions[0]?.content).toBe("const newValue = true;");
  });

  it("handles multiple hunks", () => {
    const diff = `@@ -1,2 +1,2 @@
+const first = true;
 context();
@@ -20,2 +20,3 @@
 contextAgain();
+const second = true;
`;

    const additions = extractDiffAdditions("src/api.ts", diff);

    expect(additions.map((addition) => addition.lineNumber)).toEqual([1, 21]);
    expect(additions.map((addition) => addition.content)).toEqual([
      "const first = true;",
      "const second = true;"
    ]);
  });

  it("preserves raw and content values", () => {
    const diff = `@@ -10,1 +10,1 @@
+  const spaced = true;
`;

    const additions = extractDiffAdditions("src/api.ts", diff);

    expect(additions[0]?.raw).toBe("+  const spaced = true;");
    expect(additions[0]?.content).toBe("  const spaced = true;");
  });

  it("returns an empty array when no additions exist", () => {
    const diff = `@@ -1,1 +1,1 @@
 const unchanged = true;
`;

    expect(extractDiffAdditions("src/api.ts", diff)).toEqual([]);
  });

  it("returns an empty array for non-unified text", () => {
    expect(extractDiffAdditions("src/api.ts", "const x = 1;")).toEqual([]);
  });
});
