import { defineConfig } from "astro/config";

const base = "__BASE_PATH__";

export default defineConfig({
  site: "__SITE_URL__",
  base: base === "/" ? undefined : base,
  output: "static",
});
