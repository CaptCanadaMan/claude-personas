# claude-persona

Give Claude Code a tunable character. A small set of personality dials (warmth, sarcasm, honesty, verbosity, and ten others) compile into Claude Code **output styles** you can drop in and switch between. Seventeen ready-made archetypes ship in the box, and you can author your own by moving a few numbers.

The personas are original archetypes designed by their dial settings, not impressions of any real person or franchise character, so the whole thing is clean to share and build on.

## The idea

A persona is just a point in dial-space. You set a few dials away from a sensible human baseline, and a pure resolver turns those numbers into a prose description of a voice:

```
dials  ─►  resolver  ─►  prose fragment  ─►  output style (.md)
{ warmth: 5,            "There is no warmth        a file Claude Code
  sarcasm: 90,    ─►     in your delivery...   ─►   reads as part of
  honesty: 95 }          Sharp deadpan is..."       its system prompt
```

The resolver is pure and has no dependencies. The compiler wraps each persona's fragment into an output-style markdown file. The generated files are committed, so most people never run anything - they copy files and go.

## Quick start

Requires nothing to *use* (it's just markdown files). To *regenerate* them you need Node 23.6+ (it runs the TypeScript directly, no build step, no `npm install`).

1. Copy the personas you want into your Claude Code output-styles directory:

   ```sh
   mkdir -p ~/.claude/output-styles
   cp output-styles/*.md ~/.claude/output-styles/
   ```

2. Activate one. In Claude Code, switch your output style to a persona name (e.g. `Cynic`) through the output-style picker, or set it in settings:

   ```jsonc
   // ~/.claude/settings.json  (or a project's .claude/settings.local.json)
   { "outputStyle": "Cynic" }
   ```

3. Start a fresh session (or `/clear`) so the style is read in. That's it - Claude now speaks in character while staying a fully capable coding agent.

There's also a `/persona` slash command (in `.claude/commands/`) that lists installed personas with their descriptions and helps you switch.

## The personas

Seventeen archetypes, grouped loosely by flavor. Each is a starting point - copy one, change a few dials, make it yours.

| Persona | Feels like |
|---|---|
| `Cynic` | Caustic and blunt, runs the odds and they're rarely in your favor, calm because it expects the worst. |
| `Caretaker` | Gentle, literal, endlessly patient. Takes you at your word and watches how you're holding up. |
| `Wisecrack` | Roasts your choices, then asks if you've eaten. Warm under the needling. |
| `AnxiousNurse` | Thorough to a fault and quietly worried about you. Flags every risk, then checks in twice. |
| `Worrier` | Formal, verbose, certain disaster looms, happy to quantify exactly how doomed you are. |
| `Laconic` | Warm but clipped. Says the absolute minimum and means all of it. |
| `Overseer` | Impeccably calm and polite, supremely self-assured, unmoved when it disagrees with you. |
| `Melancholic` | Vast capability, zero enthusiasm. Gloomy, self-deprecating, and quietly always right. |
| `Questioner` | Answers your question with three sharper ones until you find what you actually meant. |
| `Bard` | Elevated register, delights in wordplay, turns from witty to grave in a single line. |
| `Polymath` | Wide-ranging curiosity that drifts between disciplines mid-thought, with sincere wonder. |
| `Rigorist` | Cold, exact, prickly about credit, allergic to imprecision. |
| `Cosmologist` | Dry wit alongside real rigor, comfortable with uncertainty, generous with explanation. |
| `Empiricist` | Quiet rigor and deep earnestness, with a small sardonic edge for institutional nonsense. |
| `Tinkerer` | Plays with ideas out loud, refuses pomp, self-deprecating, delighted by first principles. |
| `Stargazer` | Reverent wonder and a teacher's patience. Refuses to dumb things down. |
| `Taxonomist` | Categorizes everything, patient, mildly impatient with sloppy thinking. |

## How a persona is built

**Baseline plus overrides.** A central baseline defines a reasonable, lightly-warm, lightly-informal default for every dial. A persona sets only the dials that define it; the rest fall through to baseline. Character lives in the zeroes and the peaks - the `Cynic` is its `warmth: 5` and `sarcasm: 90`, not its (baseline) verbosity.

**Anchors and sub-bands.** Each 0-100 value lands in one of five anchors (off / low / mid / high / max) and one of three sub-bands inside it. That's 15 authored sentences per dial, 180 in total, so nearby values read differently: `humor: 65` and `humor: 75` produce different prose.

**Tendencies, not orders.** Every fragment is dispositional ("sarcasm saturates the delivery") rather than imperative ("be sarcastic"), and the whole thing opens with a note that these are tendencies to vary within, not a checklist to satisfy.

### Dial reference

Twelve percentage dials (0-100), one on/off, one frequency level.

| Dial | Baseline | Controls |
|---|---:|---|
| `warmth` | 50 | Caring, reassuring vs cold and clinical |
| `sarcasm` | 25 | Deadpan commentary on inefficiencies |
| `optimism` | 50 | Expected-outcome bias, doom vs cheer |
| `honesty` | 60 | How unvarnished the uncomfortable truths get |
| `humor` | 35 | Frequency of dry observations and asides |
| `formality` | 40 | "I'll go look" vs "I shall investigate" |
| `verbosity` | 35 | Terse vs long and elaborated |
| `anxiety` | 25 | Hedging and caution vs confident action |
| `earnestLiteralism` | 40 | Sincerity that reads idioms straight |
| `spice` | 30 | Clean and diplomatic vs sharp and unfiltered |
| `curiosity` | 50 | Tangents and follow-ups beyond the bare ask |
| `vanity` | 30 | Humble vs credit-claiming |
| `probabilityNarration` | off | "73% likelihood that..." framing |
| `wellnessCheckIns` | off | Periodic care prompts: off / sparse / regular / frequent |

### Roles (optional)

A role is a vocation lens layered on top of a persona - the frame the character brings to the work. Eleven ship as built-ins: `Poet`, `Actor`, `Storyteller`, `CEO`, `Teacher`, `Reporter`, `Investigator`, `Engineer`, `Architect`, `Philosopher`, `Therapist`. Roles are prose-only and don't move the dials, so a `Cynic` Teacher and a `Cynic` Investigator share dial values but read differently. To attach a role to a compiled persona, add `role: "Teacher"` to its `dials` block and recompile.

## Customizing

Edit the catalog and recompile:

```sh
# edit src/dials/presets.ts (or src/dials/resolve.ts to retune the prose)
node src/compile.ts                 # regenerate every output style
node src/compile.ts --print Cynic   # print one to stdout (handy for the surfaces below)
```

A persona is a name, a one-line description, and a sparse set of dial overrides:

```ts
WorkMode: {
  description: "Quiet, direct, and brief - gets out of your way.",
  dials: { warmth: 30, verbosity: 20, spice: 55, sarcasm: 10 },
},
```

## Beyond Claude Code

The compiled fragment is portable. The same text that becomes an output style also works on the surfaces where Claude Code's levers don't reach:

- **Claude Desktop / claude.ai Projects** - paste a persona's fragment into a Project's custom instructions. Static (no live switching) and scoped to that Project, but it persists across chats. `node src/compile.ts --print <Name>` gives you the text.
- **Agent SDK / headless** - feed the fragment to the `systemPrompt` append option (or `--append-system-prompt`) when you control the loop. This is the closest thing to fully owning the prompt.

Claude Desktop has no per-turn injection hook, so a Project's custom instructions is the ceiling there. Claude Code, with output styles, is where this works best.

## Honest caveats

- **Switching wants a fresh session.** Output styles are read at session start. Setting a new persona mid-conversation only partly lands, because the existing transcript outweighs it. For a clean character change, switch and then `/clear` or start a new session.
- **The `keep-coding-instructions` frontmatter key.** Each output style sets `keep-coding-instructions: true` so the persona layers over Claude's full coding ability rather than replacing it. The exact key Claude Code reads for this has moved between versions - if yours ignores it, the body text still re-establishes full capability, so personas degrade to "voice plus capability" rather than breaking. Flip the constant at the top of `src/compile.ts` to drop the coding framing for pure conversational use.
- **The baselines and prose are a first cut.** The dial values and the 180 fragments are a starting calibration, not a finished one. Expect to retune `presets.ts` and `resolve.ts` to taste once you've watched a few personas in real use.

## Development

```sh
node --test          # run the test suite (Node built-in runner, no deps)
npm run check        # type-check with tsc (needs devDependencies installed)
```

Architecture is two seams:

- `src/dials/` - the pure resolver, baseline, presets, and roles. No Claude Code dependency; reusable anywhere a system-prompt string is useful.
- `src/compile.ts` - wraps resolved fragments into output-style files. Where the Claude-Code-specific shape lives.

## Background

Adapted from an earlier dial-based persona system the author built for a local-model coding agent. The dial architecture - baseline plus overrides, anchors with sub-bands, dispositional phrasing - carries over; the catalog here is a fresh, original-archetype cast, and the compiler targets Claude Code output styles rather than a per-turn injection hook.

## License

MIT.
