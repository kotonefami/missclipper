import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { build } from "esbuild";

(async function() {
    const manifest = JSON.parse(await readFile("manifest.common.json", "utf-8"));
    Object.assign(
        manifest,
        JSON.parse(await readFile(`manifest.${process.argv[2] === "firefox" ? "firefox" : "chromium"}.json`)),
    );
    await mkdir("dist", { recursive: true });
    await writeFile("dist/manifest.json", JSON.stringify(manifest), "utf-8");

    await cp("src/html/action.html", "dist/action.html");
    await cp("src/html/options.html", "dist/options.html");

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
        entryPoints: ["src/index.background.ts"],
        outfile: "dist/index.background.js",
        platform: "browser",
        format: "cjs",
        bundle: true,
        minify: true,
    });
})();
