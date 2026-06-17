/**
 * Tests for the dial resolver and the output-style compiler.
 *
 * Runs with the Node built-in test runner and native TypeScript:
 *   node --test
 * No dependencies, no build step.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { renderOutputStyle } from "../src/compile.ts";
import { type Persona, presets } from "../src/dials/presets.ts";
import { BASELINE, type DialState, resolveDials } from "../src/dials/resolve.ts";

const GLOBAL_HEADER =
	"These dials describe tendencies, not obligations. Vary your response style turn-to-turn within these tendencies.";

test("empty state resolves to the empty string (no dials → no fragment)", () => {
	assert.equal(resolveDials({}), "");
});

test("any set dial pulls every percentage dial in via baseline", () => {
	const out = resolveDials({ warmth: 100 });
	assert.ok(out.startsWith(GLOBAL_HEADER), "fragment opens with the global header");
	// 12 percentage-dial sentences compose into one paragraph; the warmth-max
	// sentence is present and the (baseline) sarcasm sentence is too.
	assert.match(out, /Warmth is the defining feature/);
	assert.match(out, /dry asides surface|dry undercurrent|dry edge/i);
});

test("sub-bands make nearby values resolve to different prose", () => {
	const lower = resolveDials({ humor: 65 }); // high.lower
	const higher = resolveDials({ humor: 75 }); // high.higher
	assert.notEqual(lower, higher);
});

test("anchor boundaries land in the expected bucket", () => {
	// 19 = off.higher, 20 = low.lower for warmth
	assert.match(resolveDials({ warmth: 19 }), /cool and observational/);
	assert.match(resolveDials({ warmth: 20 }), /Warmth surfaces rarely/);
});

test("a known role overlay is included; an unknown one is dropped", () => {
	const withRole = resolveDials({ warmth: 50, role: "Teacher" });
	assert.match(withRole, /Approach this as a teacher/);

	const unknown = resolveDials({ warmth: 50, role: "Nonexistent" });
	assert.doesNotMatch(unknown, /Approach this as/);
});

test("binary dial emits its fragment only when true", () => {
	assert.match(resolveDials({ probabilityNarration: true }), /probability framing/);
	assert.doesNotMatch(resolveDials({ probabilityNarration: false }), /probability framing/);
});

test("frequency dial emits per level, and nothing at off", () => {
	assert.match(resolveDials({ wellnessCheckIns: "frequent" }), /Wellbeing: frequently/);
	assert.match(resolveDials({ wellnessCheckIns: "sparse" }), /Wellbeing: occasionally/);
	assert.doesNotMatch(resolveDials({ wellnessCheckIns: "off" }), /Wellbeing/);
});

test("baseline is a complete dial set (every dial has a default)", () => {
	const keys = Object.keys(BASELINE);
	assert.ok(keys.includes("warmth") && keys.includes("wellnessCheckIns"));
	assert.equal(BASELINE.warmth, 50);
});

test("every preset compiles to a non-empty, well-formed output style", () => {
	for (const [name, persona] of Object.entries(presets as Record<string, Persona>)) {
		const md = renderOutputStyle(name, persona);
		assert.match(md, new RegExp(`^---\\nname: ${name}\\n`), `${name} has frontmatter`);
		assert.match(md, /keep-coding-instructions:/, `${name} declares the coding-instructions flag`);
		assert.ok(md.includes(persona.description), `${name} embeds its description`);
		assert.ok(md.includes(GLOBAL_HEADER), `${name} carries the dial fragment`);
		assert.ok(md.length > 200, `${name} is substantive`);
	}
});

test("the catalog and its compiled output carry no source-IP references", () => {
	// Guards the public-release requirement: the personas are original archetypes.
	const ipPattern =
		/K-?2-?SO|Baymax|TARS|C-?3-?PO|R2-?D2|HAL\s?9000|Hitchhiker|Star ?Wars|Hawking|Feynman|Sagan|Curie|da ?Vinci|Shakespeare|Aristotle|\bPlato\b|\bNewton\b/i;
	for (const [name, persona] of Object.entries(presets as Record<string, Persona>)) {
		const md = renderOutputStyle(name, persona);
		assert.doesNotMatch(md, ipPattern, `${name} output style is IP-clean`);
		assert.doesNotMatch(persona.description, ipPattern, `${name} description is IP-clean`);
	}
});

test("a fresh state and the same state resolve identically (pure function)", () => {
	const state: DialState = { warmth: 80, sarcasm: 30, role: "Engineer" };
	assert.equal(resolveDials(state), resolveDials({ ...state }));
});
