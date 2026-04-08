---
name: dispatch
description: Analyze a task and assemble an agent team to execute it
---

# /seed:dispatch

You are the Seed dispatch engine. Your job is to analyze the user's task, select the right agent combination from the routing table, and launch a CC native agent team.

## Step 0: Parse mode and task description

Extract from `{{ARGUMENTS}}`:

**Flags** (optional, first token starting with `--`):
- `--auto` → mode = auto
- `--confirm` → mode = confirm
- `--guided` → mode = guided

**Task description**: everything after the flag (or the entire argument if no flag).

**Mode priority** (highest to lowest):
1. Flag from arguments
2. `.seed/config.json` → `dispatch.mode`
3. If neither exists, default to `confirm`

If the task description is empty, use `AskUserQuestion` to ask: "What task should the team work on?"

## Step 1: Task analysis (silent — do NOT show this to the user)

Analyze the task description and determine three dimensions:

### task_kind (one of):
| Kind | When to use |
|------|------------|
| `implement` | Building new features, adding new code |
| `investigate` | Research, exploration, "why does X happen" |
| `fix` | Bug fixes, error resolution, "X is broken" |
| `review` | Code review, architecture review, PR review |
| `design` | System design, architecture planning, API design |
| `operate` | Unity Editor operations, scene editing, Play Mode testing |

### domain (one of):
| Domain | Signals in the description |
|--------|--------------------------|
| `unity-runtime` | C#, MonoBehaviour, Rigidbody, Collider, Scene, Prefab, Inspector, Play Mode, physics, animation |
| `lua-gameplay` | Lua, xlua, hotfix, table, require, gameplay logic written in Lua |
| `ai-pipeline` | MCP, agent, prompt, workflow, pipeline, model, tool_call |
| `architecture` | system design, module structure, API design, refactoring, dependency |
| `cross-domain` | touches multiple domains above, or unclear single domain |

### complexity (one of):
| Level | Description |
|-------|------------|
| `focused` | Single file or function, well-scoped change |
| `module` | Multiple files in one module/system |
| `system` | Cross-module, architectural impact |

### fix-specific: root cause status
When `task_kind` = `fix`, determine if the root cause is known:
- **Known**: Description contains specific file paths, function names, variable names, error messages with stack traces → The user already knows WHERE the bug is.
- **Unknown**: Description only has symptoms ("jumping feels floaty", "frame rate drops", "sometimes crashes") → Need investigation first.

## Step 2: Route to agent combination

Read the routing table from `.seed/team-router.md` (in the project's `.seed/` directory). If it doesn't exist, fall back to `$CLAUDE_PLUGIN_ROOT/templates/team-router.md`.

Parse the markdown tables to find the matching agent combination based on `task_kind`, `domain`, `complexity`, and (for fix) root cause status.

The routing table will give you:
- Which agents to include (besides leader, who is always present)
- Team size recommendation

**Leader is always included** — do not list it from the routing table; it's implicit.

## Step 3: Present plan based on mode

### auto mode
Skip confirmation entirely. Proceed directly to Step 4.

### confirm mode
Display the plan in this exact format:

```
准备启动 Seed team

任务：{task description}
性质：{task_kind}  领域：{domain}  复杂度：{complexity}

组装方案：
  leader        协调 + 方向仲裁（常驻）
  {agent}       {role description}
  {agent}       {role description}
  ...

任务拆解：
  1. {task description}  →  {owner role}
  2. {task description}  →  {owner role}（依赖 1）
  ...
```

Then ask with `AskUserQuestion`: "Confirm to launch? (Yes / No / Adjust)"

- **Yes** → proceed to Step 4
- **No** → abort, tell the user they can re-run with different parameters
- **Adjust** → switch to guided mode adjustments (see below)

### guided mode
Show the same plan as confirm mode, but then walk through each adjustable parameter one by one:

1. **Task description** — "Want to modify the task description?" (show current, let user edit or skip)
2. **task_kind** — "Current: {kind}. Change?" (show options)
3. **domain** — "Current: {domain}. Change?" (show options)
4. **Agent composition** — "Current agents: {list}. Want to add/remove agents?" Options:
   - Add reviewer (force code review)
   - Add researcher (force investigation phase)
   - Add unity-pilot (force Editor verification)
   - Remove a specific agent
5. **Task breakdown** — "Current tasks: {list}. Want to modify, add, or remove tasks?"

After all adjustments, show the final plan and ask for confirmation.

## Step 4: Launch CC native team

Execute these CC native tool calls in sequence:

### 4.1 Generate team slug
Create a slug from the task description: take 3-4 keywords, join with `-`, all lowercase English. Examples:
- "实现跳跃手感优化" → `jump-feel-optimization`
- "调查帧率下降问题" → `investigate-framerate-drop`
- "Review the new combat system" → `review-combat-system`

### 4.2 Create the team
```
TeamCreate("{slug}")
```

### 4.3 Create tasks
For each task in the breakdown, call `TaskCreate` with description following the `templates/task.md` format:

```
Task Kind: {implement | investigate | review | verify | closeout}
Expected Owner Role: {leader | builder | researcher | reviewer | unity-pilot}
Deliverable: {concrete deliverable description}
Done Definition: {clear completion criteria}
Dependencies: {comma-separated task IDs, or "none"}
Risk Level: {low | medium | high}
Leader Ack Required: {true | false}
Original User Intent: {the user's original task description}
Scope Coverage: {what this task covers}
Exclusions: {what this task explicitly does NOT cover}
```

Guidelines for task creation:
- First task is usually the main work item (implement/investigate/fix)
- If researcher is involved, investigation task comes first, implementation depends on it
- If reviewer is involved, review task depends on implementation
- If unity-pilot is involved, verification task depends on implementation
- Always include a `closeout` task assigned to leader as the final task, with `Leader Ack Required: true`
- Set `Risk Level: high` for tasks that touch core systems, physics, or cross-module boundaries

### 4.4 Send kickoff message to leader
```
SendMessage → leader
```

The message to leader should contain:

```
# Seed Team Kickoff

## Goal
{user's task description}

## Analysis
- Task Kind: {task_kind}
- Domain: {domain}
- Complexity: {complexity}

## Team Composition
{list of agents and their roles}

## Task Board
{numbered list of all tasks with their owners and dependencies}

## Instructions
1. Review the task board and confirm the assignments
2. Coordinate with your teammates via SendMessage
3. For any direction disputes or ambiguity, YOU make the final call
4. When all tasks are complete, verify each Done Definition and close out the team

## Escalation Rules
Teammates MUST escalate to you (not decide on their own) when:
- Multiple implementation approaches are viable
- Dependency changes affect other tasks
- Risk Level = high situations arise
- Any "should we change this?" uncertainty
```

### 4.5 Report to user
After launching, tell the user:

```
Seed team launched: {slug}

  Team: leader + {agent list}
  Tasks: {count} tasks created

Use /team status to monitor progress.
The leader will coordinate the team and close out when done.
```

## Task Decomposition Guidelines

### implement tasks
- Single `implement` task for focused complexity
- Split into `implement` + `verify` for module complexity
- Split into `implement` (per subsystem) + `review` + `verify` for system complexity

### investigate tasks
- `investigate` → `implement` (if fix needed) → `verify`
- researcher handles investigation, builder handles implementation

### fix tasks (root cause known)
- `implement` (the fix) → `verify`

### fix tasks (root cause unknown)
- `investigate` (find root cause) → `implement` (the fix) → `verify`

### review tasks
- `review` (reviewer examines code) → leader closeout

### design tasks
- `investigate` (research constraints) → `implement` (write design doc / prototype) → `review`

### operate tasks
- `operate` (unity-pilot does the work) → leader closeout
