import path from "node:path";

export function sanitizeWorkspacePath(repoRoot: string, inboundPath: string): string {
  if (path.isAbsolute(inboundPath)) {
    throw new Error(
      `Security Exception: Access denied for path outside workspace: ${inboundPath}`
    );
  }

  const absoluteRoot = path.resolve(repoRoot);
  const absoluteTarget = path.resolve(absoluteRoot, inboundPath);
  const relativePath = path.relative(absoluteRoot, absoluteTarget);

  const isInsideWorkspace =
    relativePath === "" ||
    (!relativePath.startsWith("..") && !path.isAbsolute(relativePath));

  if (!isInsideWorkspace) {
    throw new Error(
      `Security Exception: Access denied for path outside workspace: ${inboundPath}`
    );
  }

  return absoluteTarget;
}
