import { describe, expect, it } from "vitest";
import { MarkdownPolicyParser } from "../src/services/markdownPolicyParser.js";

const parser = new MarkdownPolicyParser();

describe("MarkdownPolicyParser", () => {
  it("parses structured markdown rules", () => {
    const markdown = [
      "## Rule ARCH-001: No direct fetch",
      "",
      "Severity: error",
      "Languages: typescript,javascript",
      "Pattern: \\bfetch\\s*\\(",
      "",
      "Description:",
      "Direct global fetch calls bypass the approved HTTP client.",
      "",
      "Remediation:",
      "Use the approved HTTP client.",
      "",
      "```ts",
      "import { httpClient } from \"@/lib/httpClient\";",
      "const response = await httpClient.get(\"/api/resource\");",
      "```"
    ].join("\n");

    const rules = parser.parse(markdown);

    expect(rules).toHaveLength(1);
    expect(rules[0]).toMatchObject({
      id: "ARCH-001",
      name: "No direct fetch",
      source: "markdown",
      severity: "error",
      pattern: "\\bfetch\\s*\\(",
      enabled: true,
      languages: ["typescript", "javascript"]
    });
    expect(rules[0]?.description).toContain("Direct global fetch");
    expect(rules[0]?.remediationExample).toContain("httpClient");
  });

  it("returns an empty array for free-form markdown", () => {
    expect(parser.parse("# Security\n\nPlease do secure coding.")).toEqual([]);
  });

  it("skips malformed rules without crashing", () => {
    const markdown = [
      "## Rule SEC-001: Broken Rule",
      "",
      "Severity: maybe",
      "Pattern: (secret)"
    ].join("\n");

    expect(parser.parse(markdown)).toEqual([]);
  });

  it("parses multiple rules in deterministic order", () => {
    const markdown = [
      "## Rule SEC-001: No secrets",
      "Severity: error",
      "Pattern: secret",
      "",
      "## Rule DATA-001: Tenant filter",
      "Severity: warn",
      "Pattern: SELECT"
    ].join("\n");

    const rules = parser.parse(markdown);

    expect(rules.map((rule) => rule.id)).toEqual(["SEC-001", "DATA-001"]);
  });
});
