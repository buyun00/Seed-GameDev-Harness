---
name: setup
description: Initialize Seed for the current project
---

# /seed:setup

You are executing the Seed setup wizard. Follow these phases in order.

## Phase 0: Language Selection

Read `.seed/config.json`. If `language` is already set and non-empty, skip this phase and tell the user the current language.

If `language` is not set (empty string or missing), ask the user with `AskUserQuestion`:

"Choose the language for Seed (affects all interactions, documentation, and code comments):"
- **English** — English
- **中文** — Chinese
- **日本語** — Japanese
- **한국어** — Korean

Write the chosen value (e.g. `"English"`, `"中文"`, `"日本語"`, `"한국어"`) to `.seed/config.json` under `language`.

**From this point forward, conduct the entire setup wizard in the selected language.** All subsequent questions, explanations, and the completion summary must use the chosen language.

## Phase 1: Install CLAUDE.md

Check if `--local` or `--global` was passed in `{{ARGUMENTS}}`.

- If `--local` was passed, set SCOPE to `local`.
- If `--global` was passed, set SCOPE to `global`.
- If neither was passed, ask the user:

Use `AskUserQuestion` with:
- "Where should Seed install its CLAUDE.md instructions?"
  - **local** — `.claude/CLAUDE.md` in this project (recommended for per-project setup)
  - **global** — `~/.claude/CLAUDE.md` (applies to all projects)

Then run:

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/setup-claude-md.sh" <SCOPE>
```

Report the output to the user.

## Phase 2: Configure dispatch mode

Read `.seed/config.json`. If `dispatch.mode` is already set, skip this phase and tell the user the current mode.

If `dispatch.mode` is not set, ask the user with `AskUserQuestion`:

"How should `/seed:dispatch` handle team assembly?"
- **auto** — Analyze and launch immediately, no confirmation
- **confirm** — Show the plan, one confirmation to launch (recommended)
- **guided** — Step-by-step walkthrough, you can adjust every parameter

Write the chosen mode to `.seed/config.json` under `dispatch.mode`.

## Phase 3: Enable Agent Teams

Ask the user with `AskUserQuestion`:

"Enable CC native agent teams? This is required for `/seed:dispatch` to work."
- **Yes** — Enable (recommended)
- **No** — Skip for now

If the user confirms, read or create `.claude/settings.json` in the project root, and ensure it contains:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

Merge with existing content if the file already exists — do not overwrite other settings.

## Phase 4: Complete

Write `setupCompleted` with the current ISO timestamp to `.seed/config.json`.

Output a completion summary:

```
Seed setup complete!

  CLAUDE.md:  installed ({SCOPE})
  Dispatch:   {mode} mode
  Teams:      {enabled/disabled}

Restart Claude Code to let all configuration take effect.

Quick start:
  /seed:dispatch <describe your task>
```
