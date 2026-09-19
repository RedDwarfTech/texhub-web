/**
 * Copies pdfjs-dist runtime assets (worker, cmaps, standard fonts, wasm) into
 * public/pdfjs-dist/{version}/ so the browser can reach them at
 * /pdfjs-dist/{version}/... matching pdfjs.version used at runtime.
 * Runs automatically before `pnpm dev` / `pnpm build` via predev/prebuild.
 */
import { createRequire } from "node:module";
import { copyFileSync, cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const require = createRequire(import.meta.url);
const pdfjsDistPath = dirname(require.resolve("pdfjs-dist/package.json"));
const version = require("pdfjs-dist/package.json").version;
const destDir = join(projectRoot, "public", "pdfjs-dist", version);

rmSync(destDir, { recursive: true, force: true });
mkdirSync(destDir, { recursive: true });

copyFileSync(
  join(pdfjsDistPath, "build/pdf.worker.min.mjs"),
  join(destDir, "pdf.worker.min.mjs"),
);
cpSync(join(pdfjsDistPath, "cmaps"), join(destDir, "cmaps"), {
  recursive: true,
});
cpSync(join(pdfjsDistPath, "standard_fonts"), join(destDir, "standard_fonts"), {
  recursive: true,
});
cpSync(join(pdfjsDistPath, "wasm"), join(destDir, "wasm"), {
  recursive: true,
});

console.log(`[copy-pdfjs-assets] pdfjs-dist ${version} assets copied to public/pdfjs-dist/${version}`);