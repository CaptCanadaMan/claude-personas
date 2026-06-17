---
name: claude-persona
description: >-
  Install, switch, or uninstall claude-persona - tunable personality output
  styles for Claude Code. Use when the user wants to set up or install
  claude-persona / the personas, change Claude's persona or voice, list the
  available personas, or remove claude-persona and return to stock.
---

# claude-persona

claude-persona ships a set of personality "output styles" for Claude Code (Cynic, Caretaker, Tinkerer, and others) plus a `/persona` command to switch between them. This skill installs, switches, and uninstalls it.

Find the installer first. It is either `install.ts` in the current claude-persona repo, or - if installed globally - at `~/.claude/skills/claude-persona/install.ts`. Use whichever exists; prefer the repo copy when you're inside the repo.

## Install

The installer copies the output styles, the `/persona` command, and this skill into `~/.claude` (or `$CLAUDE_CONFIG_DIR`). It writes to the user's config directory, so confirm before running.

1. Preview first if the user wants to see what changes: `node install.ts --dry-run`
2. Install: `node install.ts`
3. Tell the user to start a new session or run `/clear` so Claude Code reads the new files.

If `install.ts` and `output-styles/` aren't here, the user isn't in the repo - point them to clone `https://github.com/CaptCanadaMan/claude-persona` and run install from there.

## Switch persona

Once installed, the `/persona` command is the main way to switch:

- `/persona` - list the installed personas with their descriptions.
- `/persona <Name>` - switch to one (e.g. `/persona Cynic`).

Switching sets the active output style; it takes full effect on a new session or after `/clear`. You can also set `"outputStyle": "<Name>"` directly in `~/.claude/settings.json` or a project's `.claude/settings.local.json`.

## Uninstall (return to stock)

The installer is fully reversible - it removes exactly what it added and restores anything it overwrote.

- From the repo: `node install.ts --uninstall`
- If installed globally: `node ~/.claude/skills/claude-persona/install.ts --uninstall`

Preview with `--uninstall --dry-run` first if the user wants to see what will be removed. After uninstalling, suggest a new session or `/clear` to drop any active persona output style.
