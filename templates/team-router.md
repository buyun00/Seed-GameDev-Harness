# Seed Team Router

This file defines how `/seed:dispatch` selects agents based on task characteristics.
You can customize this file per-project by editing `.seed/team-router.md`.

> **Note**: Leader is always included in every team and is not listed in the tables below.

---

## implement

| domain | complexity | agents |
|--------|-----------|--------|
| unity-runtime | focused | builder, unity-pilot |
| unity-runtime | module | builder, unity-pilot |
| unity-runtime | system | builder, reviewer, unity-pilot |
| lua-gameplay | focused | builder |
| lua-gameplay | module | builder |
| lua-gameplay | system | builder, reviewer |
| ai-pipeline | focused | builder |
| ai-pipeline | module | builder |
| ai-pipeline | system | builder |
| architecture | focused | builder, reviewer |
| architecture | module | builder, reviewer |
| architecture | system | builder, reviewer |
| cross-domain | focused | builder, reviewer |
| cross-domain | module | builder, reviewer |
| cross-domain | system | builder, reviewer |

## investigate

| domain | complexity | agents |
|--------|-----------|--------|
| unity-runtime | focused | researcher |
| unity-runtime | module | researcher, builder |
| unity-runtime | system | researcher, builder |
| lua-gameplay | focused | researcher |
| lua-gameplay | module | researcher, builder |
| lua-gameplay | system | researcher, builder |
| ai-pipeline | focused | researcher |
| ai-pipeline | module | researcher, builder |
| ai-pipeline | system | researcher, builder |
| architecture | focused | researcher |
| architecture | module | researcher, builder |
| architecture | system | researcher, builder |
| cross-domain | focused | researcher, builder |
| cross-domain | module | researcher, builder |
| cross-domain | system | researcher, builder |

## fix

For fix tasks, routing depends on whether the root cause is known.

### Root cause known

| domain | agents |
|--------|--------|
| unity-runtime | builder, unity-pilot |
| lua-gameplay | builder |
| ai-pipeline | builder |
| architecture | builder |
| cross-domain | builder |

### Root cause unknown

| domain | agents |
|--------|--------|
| unity-runtime | researcher, builder, unity-pilot |
| lua-gameplay | researcher, builder |
| ai-pipeline | researcher, builder |
| architecture | researcher, builder |
| cross-domain | researcher, builder |

## review

| domain | agents |
|--------|--------|
| unity-runtime | reviewer, unity-pilot |
| lua-gameplay | reviewer |
| ai-pipeline | reviewer |
| architecture | reviewer |
| cross-domain | reviewer |

## design

| complexity | agents |
|-----------|--------|
| focused | researcher, builder |
| module | researcher, builder |
| system | researcher, builder, reviewer |

## operate

| agents |
|--------|
| unity-pilot |

---

## Team Size Guidelines

| Size | Composition | When to use |
|------|------------|------------|
| 2 | leader + 1 | Focused, single-domain tasks |
| 3 | leader + 2 | Module-level tasks, or tasks needing verification |
| 4 | leader + 3 | System-level tasks, cross-domain work |
| 4+ | — | Split the task into smaller dispatch calls first |

## Customization

To customize routing for your project:

1. Copy this file to `.seed/team-router.md` (done automatically by setup-init)
2. Edit the tables to match your project's needs
3. Common customizations:
   - Always include reviewer for certain domains
   - Add unity-pilot for domains that need Editor verification
   - Remove agents you don't need (e.g., if your project has no Lua)
