import { access } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";

const DEFAULT_POLICY_PATHS = [
  ".github/SECURITY.md",
  ".github/ARCHITECTURE.md",
  "SECURITY.md",
  "ARCHITECTURE.md",
  "docs/SECURITY.md",
  "docs/ARCHITECTURE.md"
] as const;

export class PolicyDiscovery {
  constructor(
    private readonly rootDir: string = process.cwd(),
    private readonly policyPaths: readonly string[] = DEFAULT_POLICY_PATHS
  ) {}

  async discoverPolicyFiles(): Promise<string[]> {
    const discovered: string[] = [];

    for (const policyPath of this.policyPaths) {
      const resolvedPath = this.resolveInsideWorkspace(policyPath);

      if (!resolvedPath) {
        console.error(`[Gatekeeper] Skipping unsafe policy path: ${policyPath}`);
        continue;
      }

      try {
        await access(resolvedPath, constants.R_OK);
        discovered.push(resolvedPath);
      } catch {
        continue;
      }
    }

    return discovered;
  }

  private resolveInsideWorkspace(candidatePath: string): string | undefined {
    const workspaceRoot = path.resolve(this.rootDir);
    const resolvedPath = path.resolve(workspaceRoot, candidatePath);
    const relativePath = path.relative(workspaceRoot, resolvedPath);

    if (
      relativePath === "" ||
      relativePath.startsWith("..") ||
      path.isAbsolute(relativePath)
    ) {
      return undefined;
    }

    return resolvedPath;
  }
}
