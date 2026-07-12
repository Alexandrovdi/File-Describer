import esbuild from "esbuild";
import process from "process";
import fs from "fs";
import path from "path";

const prod = process.argv[2] === "production";
const vaultPluginDir = "C:\\Users\\alexa\\OneDrive\\Документы\\Test_pro\\File Describer Vault\\.obsidian\\plugins\\file-describer";

function copyToVault() {
	if (!fs.existsSync(vaultPluginDir)) return;
	for (const file of ["main.js", "manifest.json", "styles.css"]) {
		const src = path.resolve(file);
		const dst = path.join(vaultPluginDir, file);
		try {
			fs.copyFileSync(src, dst);
		} catch {}
	}
}

const context = await esbuild.context({
	entryPoints: ["src/main.ts"],
	bundle: true,
	external: ["obsidian", "electron", "@codemirror/autocomplete", "@codemirror/collab", "@codemirror/commands", "@codemirror/language", "@codemirror/lint", "@codemirror/search", "@codemirror/state", "@codemirror/view", "lezer", "lezer-tree"],
	format: "cjs",
	target: "es2018",
	logLevel: "info",
	sourcemap: prod ? false : "inline",
	treeShaking: true,
	outfile: "main.js",
	minify: prod,
	plugins: [{
		name: "copy-to-vault",
		setup(build) {
			build.onEnd(() => { copyToVault(); });
		},
	}],
});

if (prod) {
	await context.rebuild();
	copyToVault();
	process.exit(0);
} else {
	await context.watch();
}
