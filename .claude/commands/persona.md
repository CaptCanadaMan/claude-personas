---
description: List claude-persona output styles, or switch the active one
argument-hint: [PersonaName]
allowed-tools: Bash(ls:*), Read, Edit, Write
---

The user ran `/persona $ARGUMENTS`.

Personas installed in this Claude Code (`~/.claude/output-styles/`):
!`ls -1 "$HOME/.claude/output-styles" 2>/dev/null | sed 's/\.md$//' | sed 's/^/  - /' || echo "  (none installed yet)"`

Personas available in this repo (`./output-styles/`):
!`ls -1 output-styles 2>/dev/null | sed 's/\.md$//' | sed 's/^/  - /' || echo "  (run from the claude-persona repo to see these)"`

Now do the following:

- **If `$ARGUMENTS` is empty:** show the lists above. For each installed persona, read the `description:` frontmatter line from its file and show it alongside the name so the user can see what each one feels like. Then tell them to run `/persona <Name>` to switch.

- **If `$ARGUMENTS` names a persona that exists in this repo's `./output-styles/` but is not yet installed:** copy that file to `~/.claude/output-styles/` first.

- **To switch to `$ARGUMENTS`:** set `"outputStyle": "$ARGUMENTS"` in this project's `.claude/settings.local.json` (create the file if missing, or merge into the existing JSON, preserving every other key). Then tell the user the persona is set, and that they should run `/clear` or start a new session for it to fully take effect - output styles are read at session start, so a mid-session swap only partly lands.

- **If `$ARGUMENTS` matches no known persona:** say so and show the available names.
