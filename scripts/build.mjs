import { cp } from "node:fs/promises";
import { build } from "esbuild";

cp("manifest.json", "dist/manifest.json");
cp("src/html/popup.html", "dist/popup.html");
cp("src/html/options.html", "dist/options.html");

build({
    entryPoints: ["src/index.content.ts"],
    outfile: "dist/index.content.js",
    platform: "browser",
    format: "cjs",
    bundle: true,
    minify: true,
});
build({
    entryPoints: ["src/index.action.ts"],
    outfile: "dist/index.action.js",
    platform: "browser",
    format: "cjs",
    bundle: true,
    minify: true,
});
build({
    entryPoints: ["src/index.options.ts"],
    outfile: "dist/index.options.js",
    platform: "browser",
    format: "cjs",
    bundle: true,
    minify: true,
});
