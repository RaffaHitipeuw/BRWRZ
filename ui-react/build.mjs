import { build, context } from "esbuild";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const outdir = path.join(root, "ui", "js", "generated");
const watch = process.argv.includes("--watch");

await mkdir(outdir, { recursive: true });

const bundleOptions = {
  entryPoints: {
    shell: path.join(here, "src", "main.jsx"), // Bundel main.jsx menjadi shell.js & shell.css
  },
  bundle: true,
  format: "iife", // Wajib IIFE agar tidak diblokir CORS file:// di CEF
  platform: "browser",
  target: ["chrome120"],
  outdir,
  entryNames: "[name]",
  jsx: "automatic",
  loader: {
    ".svg": "dataurl",
    ".png": "dataurl",
    ".ttf": "file",
    ".woff": "file",
    ".woff2": "file",
  },
  logLevel: "info",
};

if (watch) {
  const ctx = await context(bundleOptions);
  await ctx.watch();
  console.log("[build:ui] watching for changes...");
} else {
  await build(bundleOptions);
  console.log("[build:ui] sukses bundel ke ui/js/generated/shell.js!");
}
