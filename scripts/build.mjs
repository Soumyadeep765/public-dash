import { spawnSync } from "node:child_process";

// Workers Builds sets WORKERS_CI. OpenNext must run there so
// `wrangler deploy` can find `.open-next`. Other hosts keep `next build`.
const workersCi = Boolean(process.env.WORKERS_CI);
const command = workersCi ? "opennextjs-cloudflare build" : "next build";
const result = spawnSync(command, {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

process.exit(result.status ?? 1);
