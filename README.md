# claude-persona

Give Claude Code a personality you can dial in.

claude-persona ships a set of character "voices" for Claude Code - blunt and caustic, warm and patient, dry and rigorous, and more. You switch between them with a `/persona` command. Seventeen are ready to use out of the box, and you can build your own by changing a few numbers.

Under the hood, each persona is a set of personality dials (warmth, sarcasm, honesty, verbosity, and ten others) that compile into a Claude Code **output style**. Claude stays a fully capable coding agent - the persona only changes how it talks.

---

## Install

Clone the repo, then let Claude install it for you:

```sh
git clone https://github.com/CaptCanadaMan/claude-persona
cd claude-persona
```

Open Claude Code in that folder and say **"install claude-persona."** The bundled skill copies everything into your `~/.claude` directory and tells you what it did.

Prefer to run it yourself? Same result:

```sh
node install.ts          # needs Node 23.6+ (no npm install required)
```

Either way, **start a new session or run `/clear`** afterward so Claude Code picks up the new files.

> No Node and don't want it? You can install by hand: `mkdir -p ~/.claude/output-styles && cp output-styles/*.md ~/.claude/output-styles/`. You'll get the personas but not the `/persona` command.

---

## How to use

The `/persona` command is how you drive it.

**See what's available:**

```
/persona
```

Lists every installed persona with a one-line description of how it feels to talk to.

**Switch to one:**

```
/persona Cynic
```

That sets the active voice. Output styles load at the start of a session, so **run `/clear` (or open a new session) for the change to fully land.**

**Go back to plain Claude:** switch your output style back to Default the same way you'd switch personas, through Claude Code's output-style setting.

That's the whole loop: `/persona` to look, `/persona <Name>` to pick, `/clear` to commit.

---

## The personas

| Persona | How it feels |
|---|---|
| `Cynic` | Caustic and blunt. Runs the odds, and they're rarely in your favor. |
| `Caretaker` | Gentle, literal, endlessly patient. Watches how you're holding up. |
| `Wisecrack` | Roasts your choices, then asks if you've eaten. Warm under the needling. |
| `AnxiousNurse` | Thorough to a fault and quietly worried about you. |
| `Worrier` | Formal, verbose, certain disaster looms - and happy to quantify it. |
| `Laconic` | Warm but clipped. Says the minimum and means all of it. |
| `Overseer` | Calm, polite, supremely self-assured. Unmoved when it disagrees. |
| `Melancholic` | Vast capability, zero enthusiasm. Gloomy and quietly always right. |
| `Questioner` | Answers your question with three sharper ones. |
| `Bard` | Elevated, playful with words, turns from witty to grave in a line. |
| `Polymath` | Wide-ranging curiosity that drifts between disciplines mid-thought. |
| `Rigorist` | Cold, exact, prickly about credit, allergic to imprecision. |
| `Cosmologist` | Dry wit plus real rigor. Comfortable with uncertainty. |
| `Empiricist` | Quiet rigor and earnestness, with a sardonic edge for nonsense. |
| `Tinkerer` | Plays with ideas out loud. Refuses pomp. Loves first principles. |
| `Stargazer` | Reverent wonder and a teacher's patience. Won't dumb things down. |
| `Taxonomist` | Categorizes everything. Patient, but impatient with sloppy thinking. |

These are original archetypes, designed by their dial settings - not impressions of any real person or franchise character.

---

## Make your own

A persona is a name, a one-line description, and a few dial values. Edit `src/dials/presets.ts`:

```ts
WorkMode: {
  description: "Quiet, direct, and brief - gets out of your way.",
  dials: { warmth: 30, verbosity: 20, spice: 55, sarcasm: 10 },
},
```

Then regenerate and reinstall:

```sh
node src/compile.ts      # rebuild the output styles
node install.ts          # copy the updated set into ~/.claude
```

You only set the dials that define the character; everything else sits at a sensible baseline. The full dial list is in [How it works](#how-it-works) below.

---

## Uninstall

Fully reversible. It removes exactly what it added and restores anything it replaced.

Ask Claude to **"uninstall claude-persona,"** or run it directly:

```sh
node install.ts --uninstall
# or, if you installed globally and don't have the repo handy:
node ~/.claude/skills/claude-persona/install.ts --uninstall
```

Add `--dry-run` to either install or uninstall to preview the changes without writing anything.

---

## Use it outside Claude Code

The text a persona compiles to is portable, so it works on surfaces where the `/persona` command can't reach:

- **Claude Desktop / claude.ai Projects** - run `node src/compile.ts --print Cynic` and paste the output into a Project's custom instructions. Static (no live switching), but it persists across that Project's chats.
- **Agent SDK / headless** - feed the same text to the `systemPrompt` append option when you control the loop.

Claude Desktop has no way to swap a persona per turn, so a Project's custom instructions is as far as it goes there. Claude Code is where this works best.

---

## How it works

Each dial value becomes a sentence of prose; together they describe a voice, which becomes the body of an output style:

```
dials  ->  resolver  ->  prose  ->  output style (.md that Claude Code reads)
```

Three ideas make the dials expressive:

- **Baseline plus overrides.** Every dial has a sensible default. A persona only sets the ones that define it, so character lives in the extremes - `Cynic` is its `warmth: 5` and `sarcasm: 90`, not its average verbosity.
- **Fine resolution.** Each 0-100 value lands in one of five bands and one of three sub-bands inside it, so `humor: 65` and `humor: 75` read differently. That's 180 authored sentences across the twelve dials.
- **Tendencies, not orders.** Every line is written as a leaning ("sarcasm saturates the delivery"), not a command, with a note to vary within it. Less robotic, less on-rails.

### Dial reference

Twelve dials run 0-100; two are switches.

| Dial | Default | Controls |
|---|---:|---|
| `warmth` | 50 | Caring and reassuring vs cold and clinical |
| `sarcasm` | 25 | Deadpan commentary on inefficiencies |
| `optimism` | 50 | Doom-leaning vs cheerful outlook |
| `honesty` | 60 | How unvarnished the hard truths get |
| `humor` | 35 | Frequency of dry observations and asides |
| `formality` | 40 | "I'll go look" vs "I shall investigate" |
| `verbosity` | 35 | Terse vs long and elaborated |
| `anxiety` | 25 | Hedging and caution vs confident action |
| `earnestLiteralism` | 40 | Reads idioms and jokes straight |
| `spice` | 30 | Clean and diplomatic vs sharp and unfiltered |
| `curiosity` | 50 | Tangents and follow-ups beyond the bare ask |
| `vanity` | 30 | Humble vs credit-claiming |
| `probabilityNarration` | off | "73% likelihood that..." framing |
| `wellnessCheckIns` | off | Periodic check-ins: off / sparse / regular / frequent |

### Roles (optional)

A role is a vocation lens layered on top of a persona - the frame it brings to the work. Eleven ship as built-ins (`Teacher`, `Investigator`, `Engineer`, `Poet`, and more). They change framing without moving the dials, so a `Cynic` Teacher and a `Cynic` Investigator share dial values but read differently. Add `role: "Teacher"` to a persona's `dials` block and recompile to attach one.

---

## Good to know

- **Switching wants a fresh session.** Output styles are read at session start. Setting a new persona mid-conversation only partly lands, because the existing transcript outweighs it. Switch, then `/clear`.
- **Coding stays on.** Each persona keeps Claude's full coding ability and layers voice on top (via `keep-coding-instructions: true`). The exact frontmatter key has shifted between Claude Code versions; if yours ignores it, the persona text still re-establishes capability, so it degrades to "voice plus capability" rather than breaking. Flip the constant at the top of `src/compile.ts` for pure conversational use.
- **The prose is a first cut.** The dial values and the 180 sentences are a starting calibration. Expect to retune them to taste once you've watched a few personas in action.

---

## Development

```sh
node --test          # run the test suite (Node's built-in runner, no deps)
npm run check        # type-check with tsc (needs devDependencies installed)
node src/compile.ts  # regenerate output styles after editing the catalog
```

Two seams:

- `src/dials/` - the pure resolver, baseline, presets, and roles. No Claude Code dependency; reusable anywhere a system-prompt string is useful.
- `src/compile.ts` and `install.ts` - turn resolved personas into output styles and put them where Claude Code reads them.

---

## Background

Adapted from an earlier dial-based persona system the author built for a local-model coding agent. The dial architecture carries over; the cast here is a fresh, original-archetype set, and it targets Claude Code output styles.

## License

MIT.
