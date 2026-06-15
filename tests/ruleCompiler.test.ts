import { describe, expect, it } from "vitest";
import { RuleCompiler } from "../src/services/ruleCompiler.js";
import type { PolicyRule } from "../src/types/index.js";

const compiler = new RuleCompiler();

const builtInRule: PolicyRule = {
  id: "ARCH-001",
  name: "No direct fetch",
  source: "builtin",
  pattern: "fetch",
  severity: "error",
  description: "Do not use fetch directly.",
  enabled: true
};

describe("RuleCompiler", () => {
  it("returns built-in rules when no markdown rules exist", () => {
    expect(compiler.compile([builtInRule], [])).toEqual([builtInRule]);
  });

  it("allows markdown rules to override built-in rules with the same id", () => {
    const markdownRule: PolicyRule = {
      ...builtInRule,
      source: "markdown",
      description: "Use the internal platform client.",
      severity: "warn"
    };

    const compiled = compiler.compile([builtInRule], [markdownRule]);

    expect(compiled).toHaveLength(1);
    expect(compiled[0]).toMatchObject({
      id: "ARCH-001",
      source: "markdown",
      severity: "warn",
      description: "Use the internal platform client."
    });
  });

  it("returns deterministic ordering by rule id", () => {
    const dataRule: PolicyRule = {
      ...builtInRule,
      id: "DATA-001",
      name: "Tenant filter"
    };

    const compiled = compiler.compile([dataRule, builtInRule], []);

    expect(compiled.map((rule) => rule.id)).toEqual(["ARCH-001", "DATA-001"]);
  });

  it("ignores malformed rules", () => {
    const malformedRule: PolicyRule = {
      ...builtInRule,
      id: "BAD-001",
      name: ""
    };

    const compiled = compiler.compile([builtInRule, malformedRule], []);

    expect(compiled.map((rule) => rule.id)).toEqual(["ARCH-001"]);
  });
});
