import path from "node:path";

export type GatekeeperConfig = {
  workspaceRoot: string;
};

export function loadConfig(): GatekeeperConfig {
  return {
    workspaceRoot: path.resolve(process.env.GATEKEEPER_WORKSPACE ?? process.cwd())
  };
}
