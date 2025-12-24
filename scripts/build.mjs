import { cp, readFile, writeFile } from "node:fs/promises";
import { build } from "esbuild";

// cp("manifest.json", "dist/manifest.json");
const manifest = JSON.parse(await readFile("manifest.common.json", "utf-8"))
Object.assign(
    manifest,
    JSON.parse(
        await readFile(`manifest.${process.argv[2] === "firefox" ? "firefox" : "chromium"}.json`)
    )
)
writeFile("dist/manifest.json", JSON.stringify(manifest), "utf-8")

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
build({
    entryPoints: ["src/background.ts"],
    outfile: "dist/background.js",
    platform: "browser",
    format: "cjs",
    bundle: true,
    minify: true,
});