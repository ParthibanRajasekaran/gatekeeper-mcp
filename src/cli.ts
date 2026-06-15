#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import process from "node:process";
import { loadConfig } from "./config.js";
import { runGatekeeperAudit } from "./services/auditRunner.js";
import { sanitizeWorkspacePath } from "./services/pathSanitizer.js";
import { formatAuditResponse } from "./tools/auditDiff.js";
import { AuditDiffSchema, type SupportedLanguage } from "./types/index.js";

type CliArgs = {
  command?: string;
  diffPath?: string;
  filePath?: string;
  language?: SupportedLanguage;
  workspaceRoot?: string;
  help: boolean;
};

const SUPPORTED_LANGUAGES = new Set<SupportedLanguage>([
  "typescript",
  "javascript",
  "python",
  "go",
  "generic"
]);

export async function runCli(argv: string[]): Promise<number> {
  const args = parseArgs(argv);

  if (args.help || !args.command) {
    console.log(renderHelp());
    return 0;
  }

  if (args.command !== "audit") {
    console.error(`Unknown command: ${args.command}`);
    console.error(renderHelp());
    return 2;
  }

  if (!args.diffPath || !args.filePath) {
    console.error("Missing required arguments: --diff and --file are required.");
    console.error(renderHelp());
    return 2;
  }

  const language = args.language ?? "generic";
  if (!SUPPORTED_LANGUAGES.has(language)) {
    console.error(`Unsupported language: ${language}`);
    return 2;
  }

  const workspaceRoot = args.workspaceRoot ?? loadConfig().workspaceRoot;

  try {
    const diffFilePath = sanitizeWorkspacePath(workspaceRoot, args.diffPath);
    const diffString = await readFile(diffFilePath, "utf8");
    const parsed = AuditDiffSchema.safeParse({
      filePath: args.filePath,
      language,
      diffString
    });

    if (!parsed.success) {
      console.error(`[Gatekeeper] Invalid audit request.\n\n${parsed.error.message}`);
      return 2;
    }

    sanitizeWorkspacePath(workspaceRoot, parsed.data.filePath);
    const result = await runGatekeeperAudit(parsed.data, { workspaceRoot });
    console.log(formatAuditResponse(parsed.data.filePath, result));
    return result.isCompliant ? 0 : 1;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown CLI error";
    console.error(`[Gatekeeper] CLI audit failed.\n\n${message}`);
    return 2;
  }
}

function parseArgs(argv: string[]): CliArgs {
  const parsed: CliArgs = {
    help: false
  };

  if (argv[0]) {
    parsed.command = argv[0];
  }

  for (let index = 1; index < argv.length; index += 1) {
    const current = argv[index];
    const next = argv[index + 1];

    if (current === "--help" || current === "-h") {
      parsed.help = true;
      continue;
    }

    if (!next) {
      continue;
    }

    if (current === "--diff") {
      parsed.diffPath = next;
      index += 1;
      continue;
    }

    if (current === "--file") {
      parsed.filePath = next;
      index += 1;
      continue;
    }

    if (current === "--language") {
      parsed.language = next as SupportedLanguage;
      index += 1;
      continue;
    }

    if (current === "--workspace") {
      parsed.workspaceRoot = next;
      index += 1;
    }
  }

  return parsed;
}

function renderHelp(): string {
  return [
    "Gatekeeper-MCP CLI",
    "",
    "Usage:",
    "  gatekeeper-mcp audit --diff <patch-file> --file <repo-file> [--language <language>] [--workspace <repo-root>]",
    "",
    "Examples:",
    "  gatekeeper-mcp audit --diff demo/failing-diff.patch --file src/api/users.ts --language typescript",
    "  gatekeeper-mcp audit --diff demo/passing-diff.patch --file src/api/users.ts --language typescript",
    "",
    "Languages:",
    "  typescript, javascript, python, go, generic"
  ].join("\n");
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  const exitCode = await runCli(process.argv.slice(2));
  process.exit(exitCode);
}
