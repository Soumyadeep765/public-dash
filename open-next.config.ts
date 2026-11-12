import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default {
  ...defineCloudflareConfig(),
  // OpenNext would otherwise call `npm run build`, which on Workers is this
  // adapter build. Call Next directly so the two do not recurse.
  buildCommand: "npx next build",
};
