import { cp } from "node:fs/promises";
import { build } from "esbuild";

cp("manifest.json", "dist/manifest.json");
cp("src/html/popup.html", "dist/popup.html");

build({
    entryPoints: ["src/index.twitter.ts"],
    outfile: "dist/index.twitter.js",
    platform: "browser",
    format: "cjs",
    bundle: true,
    minify: true
});
build({
    entryPoints: ["src/index.action.ts"],
    outfile: "dist/index.action.js",
    platform: "browser",
    format: "cjs",
    bundle: true,
    minify: true
});
