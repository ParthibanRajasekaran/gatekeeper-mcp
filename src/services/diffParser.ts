import type { DiffAddition } from "../types/index.js";

const HUNK_HEADER_PATTERN = /^@@\s+-(?:\d+)(?:,\d+)?\s+\+(\d+)(?:,\d+)?\s+@@/;

export function extractDiffAdditions(
  filePath: string,
  diffString: string
): DiffAddition[] {
  const additions: DiffAddition[] = [];
  const lines = diffString.split(/\r?\n/);
  let currentNewLine = 0;
  let hasActiveHunk = false;

  for (const rawLine of lines) {
    const hunkMatch = HUNK_HEADER_PATTERN.exec(rawLine);

    if (hunkMatch?.[1]) {
      currentNewLine = Number.parseInt(hunkMatch[1], 10);
      hasActiveHunk = Number.isFinite(currentNewLine);
      continue;
    }

    if (!hasActiveHunk) {
      continue;
    }

    if (rawLine.startsWith("+++")) {
      continue;
    }

    if (rawLine.startsWith("+")) {
      const content = rawLine.slice(1);
      additions.push({
        filePath,
        lineNumber: currentNewLine,
        content,
        raw: rawLine
      });
      currentNewLine += 1;
      continue;
    }

    if (rawLine.startsWith("-")) {
      continue;
    }

    if (rawLine.startsWith("\\ No newline at end of file")) {
      continue;
    }

    currentNewLine += 1;
  }

  return additions;
}
