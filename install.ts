/**
 * Install (or uninstall) claude-persona into your Claude Code config directory.
 *
 *   node install.ts              Install: copy output styles, the /persona
 *                                command, and the claude-persona skill into
 *                                ~/.claude (or $CLAUDE_CONFIG_DIR).
 *   node install.ts --uninstall  Remove everything this installed and restore
 *                                any files it overwrote - back to stock.
 *   node install.ts --dry-run    Show what would change, write nothing.
 *
 * Reversibility: every file written is recorded in a manifest
 * (`.claude-persona-install.json`). If installing would overwrite a file you
 * already had, the original is backed up first and restored on uninstall. So
 * uninstall removes exactly what we added and nothing else.
 *
 * Runs on bare `node` (Node 23.6+ native TypeScript) - no dependencies.
 */

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const BACKUP_SUFFIX = ".claude-persona.bak";
const MANIFEST_NAME = ".claude-persona-install.json";

interface ManifestEntry {
	/** Absolute path of the installed file. */
	path: string;
	/** Was a pre-existing (foreign) file backed up before we wrote this one? */
	backedUp: boolean;
}

interface Manifest {
	name: "claude-persona";
	version: string;
	installedAt: string;
	files: ManifestEntry[];
}

const dryRun = process.argv.includes("--dry-run");
const uninstall = process.argv.includes("--uninstall");

const repoRoot = import.meta.dirname;
const claudeDir = process.env.CLAUDE_CONFIG_DIR?.trim() || join(homedir(), ".claude");
const manifestPath = join(claudeDir, MANIFEST_NAME);

/** Read the package version without importing JSON (keeps this self-contained). */
function readVersion(): string {
	try {
		const pkg = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf-8")) as { version?: string };
		return pkg.version ?? "0.0.0";
	} catch {
		return "0.0.0";
	}
}

function log(msg: string): void {
	console.log(msg);
}

/** The set of (source → destination) files this installer manages. */
function plannedFiles(): Array<{ src: string; dest: string }> {
	const stylesDir = join(repoRoot, "output-styles");
	if (!existsSync(stylesDir)) {
		console.error(
			`Could not find output-styles/ next to this script (${repoRoot}).\n` +
				"Run install from inside the cloned claude-persona repo.",
		);
		process.exit(1);
	}

	const files: Array<{ src: string; dest: string }> = [];

	for (const name of readdirSync(stylesDir).filter((f) => f.endsWith(".md"))) {
		files.push({ src: join(stylesDir, name), dest: join(claudeDir, "output-styles", name) });
	}

	files.push({
		src: join(repoRoot, ".claude", "commands", "persona.md"),
		dest: join(claudeDir, "commands", "persona.md"),
	});
	files.push({
		src: join(repoRoot, ".claude", "skills", "claude-persona", "SKILL.md"),
		dest: join(claudeDir, "skills", "claude-persona", "SKILL.md"),
	});
	// Copy this installer next to the skill so `--uninstall` works without the repo.
	files.push({
		src: join(repoRoot, "install.ts"),
		dest: join(claudeDir, "skills", "claude-persona", "install.ts"),
	});

	return files.filter(({ src }) => existsSync(src));
}

function doInstall(): void {
	const planned = plannedFiles();
	const prior = readManifest();
	const priorByPath = new Map(prior?.files.map((f) => [f.path, f]) ?? []);

	log(`Installing claude-persona into ${claudeDir}${dryRun ? "  (dry run)" : ""}\n`);

	const entries: ManifestEntry[] = [];
	let created = 0;
	let overwritten = 0;
	let backedUp = 0;

	for (const { src, dest } of planned) {
		const existedBefore = existsSync(dest);
		const ours = priorByPath.has(dest);
		// Back up only a foreign pre-existing file, and only once.
		const shouldBackup = existedBefore && !ours && !existsSync(dest + BACKUP_SUFFIX);
		const carriedBackup = ours ? (priorByPath.get(dest)?.backedUp ?? false) : false;

		if (existedBefore && !ours) {
			overwritten++;
			if (shouldBackup) backedUp++;
		} else if (!existedBefore) {
			created++;
		}

		if (!dryRun) {
			mkdirSync(dirname(dest), { recursive: true });
			if (shouldBackup) renameSync(dest, dest + BACKUP_SUFFIX);
			copyFileSync(src, dest);
		}

		entries.push({ path: dest, backedUp: shouldBackup || carriedBackup });
	}

	const manifest: Manifest = {
		name: "claude-persona",
		version: readVersion(),
		installedAt: new Date().toISOString(),
		files: entries,
	};
	if (!dryRun) writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf-8");

	log(`  ${entries.length} files  (${created} new, ${overwritten} replaced, ${backedUp} backed up)`);
	log("");
	log(dryRun ? "Dry run complete - nothing was written." : "Installed. Next steps:");
	if (!dryRun) {
		log("  1. Start a new Claude Code session (or run /clear) so it picks up the new files.");
		log("  2. Run /persona to list the personas, or /persona <Name> to switch.");
		log("  3. To return to stock later: ask Claude to \"uninstall claude-persona\", or run");
		log(`     node ${join(claudeDir, "skills", "claude-persona", "install.ts")} --uninstall`);
	}
}

function doUninstall(): void {
	const manifest = readManifest();
	if (!manifest) {
		log(`No claude-persona install found in ${claudeDir} (no manifest). Nothing to do.`);
		return;
	}

	log(`Uninstalling claude-persona from ${claudeDir}${dryRun ? "  (dry run)" : ""}\n`);

	let removed = 0;
	let restored = 0;

	for (const entry of manifest.files) {
		const backup = entry.path + BACKUP_SUFFIX;
		if (entry.backedUp && existsSync(backup)) {
			if (!dryRun) {
				rmSync(entry.path, { force: true });
				renameSync(backup, entry.path);
			}
			restored++;
		} else if (existsSync(entry.path)) {
			if (!dryRun) rmSync(entry.path, { force: true });
			removed++;
		}
	}

	// Remove the skill directory if it's now empty, then the manifest.
	const skillDir = join(claudeDir, "skills", "claude-persona");
	if (!dryRun) {
		if (existsSync(skillDir) && readdirSync(skillDir).length === 0) rmSync(skillDir, { recursive: true, force: true });
		rmSync(manifestPath, { force: true });
	}

	log(`  ${removed} removed, ${restored} restored from backup.`);
	log("");
	log(dryRun ? "Dry run complete - nothing was changed." : "Back to stock. Start a new session or /clear to clear any active persona output style.");
}

function readManifest(): Manifest | null {
	if (!existsSync(manifestPath)) return null;
	try {
		return JSON.parse(readFileSync(manifestPath, "utf-8")) as Manifest;
	} catch {
		return null;
	}
}

// Only act when run directly, not if imported.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
	if (uninstall) doUninstall();
	else doInstall();
}
