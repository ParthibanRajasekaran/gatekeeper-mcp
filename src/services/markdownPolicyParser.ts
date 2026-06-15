import type { PolicyRule, Severity, SupportedLanguage } from "../types/index.js";

const RULE_HEADING_PATTERN = /^##\s+Rule\s+([A-Z]+-\d+):\s+(.+)$/gm;
const VALID_SEVERITIES = new Set<Severity>(["info", "warn", "error"]);
const VALID_LANGUAGES = new Set<SupportedLanguage>([
  "typescript",
  "javascript",
  "python",
  "go",
  "generic"
]);

export class MarkdownPolicyParser {
  parse(markdown: string): PolicyRule[] {
    const sections = this.extractRuleSections(markdown);
    const rules: PolicyRule[] = [];

    for (const section of sections) {
      const rule = this.parseSection(section);
      if (rule) {
        rules.push(rule);
      }
    }

    return rules;
  }

  private extractRuleSections(markdown: string): RuleSection[] {
    const matches = [...markdown.matchAll(RULE_HEADING_PATTERN)];
    const sections: RuleSection[] = [];

    for (let index = 0; index < matches.length; index += 1) {
      const match = matches[index];
      const nextMatch = matches[index + 1];

      if (!match?.index || !match[1] || !match[2]) {
        continue;
      }

      const bodyStart = match.index + match[0].length;
      const bodyEnd = nextMatch?.index ?? markdown.length;
      sections.push({
        id: match[1].trim(),
        name: match[2].trim(),
        body: markdown.slice(bodyStart, bodyEnd)
      });
    }

    return sections;
  }

  private parseSection(section: RuleSection): PolicyRule | undefined {
    const severity = this.readInlineField(section.body, "Severity")?.toLowerCase();
    const pattern = this.readInlineField(section.body, "Pattern");

    if (!severity || !VALID_SEVERITIES.has(severity as Severity) || !pattern) {
      return undefined;
    }

    const languages = this.parseLanguages(this.readInlineField(section.body, "Languages"));
    const description =
      this.readBlockField(section.body, "Description") ||
      this.readBlockField(section.body, "Remediation") ||
      section.name;
    const remediationExample = this.extractFirstCodeBlock(
      this.readBlockField(section.body, "Remediation") || ""
    );

    const rule: PolicyRule = {
      id: section.id,
      name: section.name,
      source: "markdown",
      pattern,
      severity: severity as Severity,
      description: description.trim(),
      enabled: true
    };

    if (languages.length > 0) {
      rule.languages = languages;
    }

    if (remediationExample) {
      rule.remediationExample = remediationExample;
    }

    return rule;
  }

  private readInlineField(body: string, fieldName: string): string | undefined {
    const pattern = new RegExp(`^${fieldName}:\\s*(.+)$`, "im");
    const match = pattern.exec(body);
    return match?.[1]?.trim();
  }

  private readBlockField(body: string, fieldName: string): string | undefined {
    const pattern = new RegExp(
      `^${fieldName}:\\s*\\n([\\s\\S]*?)(?=^\\w+:\\s*|^##\\s+Rule|\\z)`,
      "im"
    );
    const match = pattern.exec(body);
    return match?.[1]?.trim();
  }

  private parseLanguages(rawLanguages: string | undefined): SupportedLanguage[] {
    if (!rawLanguages) {
      return [];
    }

    return rawLanguages
      .split(",")
      .map((language) => language.trim().toLowerCase())
      .filter((language): language is SupportedLanguage =>
        VALID_LANGUAGES.has(language as SupportedLanguage)
      );
  }

  private extractFirstCodeBlock(markdown: string): string | undefined {
    const match = /```(?:\w+)?\n([\s\S]*?)```/.exec(markdown);
    return match?.[1]?.trim();
  }
}

type RuleSection = {
  id: string;
  name: string;
  body: string;
};
