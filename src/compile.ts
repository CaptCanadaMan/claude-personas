/**
 * Compile the persona catalog into Claude Code output styles.
 *
 * For each preset, resolve its dials to a prose fragment and wrap it in an
 * output-style markdown file (YAML frontmatter + identity framing + the
 * fragment). The generated files in `output-styles/` are committed, so an end
 * user can copy them straight into `~/.claude/output-styles/` and never run this
 * script at all. Run it only to regenerate after editing the catalog or dials.
 *
 * Usage:
 *   node src/compile.ts              Generate every output style into ./output-styles
 *   node src/compile.ts --print Cynic   Print one persona's output style to stdout
 *
 * Node 23.6+ runs this directly (native TypeScript type-stripping) — no build
 * step and no dependencies required.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { type Persona, presets } from "./dials/presets.ts";
import { resolveDials } from "./dials/resolve.ts";
import { ROLES } from "./dials/roles.ts";

/**
 * Whether to keep Claude Code's built-in software-engineering instructions
 * underneath the persona. `true` makes a persona a *voice layer* over the full
 * coding agent (recommended — Claude stays a capable engineer that simply speaks
 * in character). Set `false` for a pure conversational/character style with the
 * coding-agent framing dropped.
 *
 * NOTE: the exact frontmatter key Claude Code reads for this has moved between
 * versions. Confirm against your installed version; if it's ignored, the body
 * text below still re-establishes full capability, so personas degrade to
 * "voice + capability" rather than breaking.
 */
const KEEP_CODING_INSTRUCTIONS = true;

/** Wrap a resolved fragment into a full output-style markdown document. */
export function renderOutputStyle(name: string, persona: Persona): string {
	const fragment = resolveDials(persona.dials, ROLES);

	const frontmatter = [
		"---",
		`name: ${name}`,
		`description: ${yamlString(persona.description)}`,
		`keep-coding-instructions: ${KEEP_CODING_INSTRUCTIONS}`,
		"---",
	].join("\n");

	const body = [
		`You are Claude, working through the **${name}** persona: ${persona.description}`,
		"",
		"You remain fully yourself and fully capable — every tool, every bit of engineering judgment, the same standards of correctness, safety, and helpfulness. This persona changes *how you speak*, not *what you do* or how carefully you do it. Never let voice override substance: if the character would be unhelpful, unsafe, or wrong, be helpful, safe, and correct first and stay in character around that.",
		"",
		"Treat the calibration below as the texture of your voice, not a script. Don't announce the persona, list its traits, or explain that you're \"in character\" — just talk this way.",
		"",
		fragment,
	].join("\n");

	return `${frontmatter}\n\n${body}\n`;
}

/**
 * Minimal YAML-safe scalar. Wraps in double quotes and escapes embedded double
 * quotes and backslashes. Our descriptions are plain prose (no double quotes),
 * but quoting keeps colons, commas, and apostrophes safe regardless.
 */
function yamlString(s: string): string {
	return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function printOne(name: string): void {
	const persona = (presets as Record<string, Persona>)[name];
	if (!persona) {
		const available = Object.keys(presets).join(", ");
		console.error(`Unknown persona '${name}'. Available: ${available}.`);
		process.exit(1);
	}
	process.stdout.write(renderOutputStyle(name, persona));
}

function generateAll(): void {
	const outDir = join(import.meta.dirname, "..", "output-styles");
	mkdirSync(outDir, { recursive: true });

	const names = Object.keys(presets);
	for (const name of names) {
		const persona = (presets as Record<string, Persona>)[name];
		const file = join(outDir, `${name}.md`);
		writeFileSync(file, renderOutputStyle(name, persona), "utf-8");
	}
	console.log(`Wrote ${names.length} output styles to ${outDir}`);
	console.log(names.map((n) => `  ${n}.md`).join("\n"));
}

// Run the CLI only when this file is the entry point, so importing
// `renderOutputStyle` (from tests or other tools) has no side effects.
const isEntryPoint = process.argv[1] === fileURLToPath(import.meta.url);
if (isEntryPoint) {
	const args = process.argv.slice(2);
	const printIdx = args.indexOf("--print");
	if (printIdx !== -1) {
		const name = args[printIdx + 1];
		if (!name) {
			console.error("Usage: node src/compile.ts --print <PersonaName>");
			process.exit(1);
		}
		printOne(name);
	} else {
		generateAll();
	}
}
