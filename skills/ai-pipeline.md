---
name: ai-pipeline
description: AI pipeline 设计原则和 MCP tool 使用规范
triggers:
  - agent
  - mcp
  - workflow
  - pipeline
  - tool
  - prompt
---

## AI Pipeline Design Principles

### Agent Design

- **Single Responsibility**: Each agent should have one clear job. If an agent needs to do two different things, split it into two agents.
- **Explicit Communication**: Agents communicate through structured messages (SendMessage), not shared mutable state.
- **Escalation Over Assumption**: When uncertain, agents should escalate to leader rather than guess. Wrong decisions propagate faster than correct ones.
- **Idempotent Operations**: Design agent tasks so they can be safely retried if interrupted.

### MCP Tool Integration

- **Tool Boundaries**: MCP tools provide domain-specific capabilities (knowledge retrieval, editor operations, etc.). Agents should use tools for what they're designed for, not as general-purpose workarounds.
- **Error Handling**: Always check tool_call results. MCP tools can fail due to network issues, server restarts, or invalid inputs. Handle failures gracefully.
- **Rate Awareness**: Some MCP servers have rate limits. Batch related queries when possible rather than making many small calls.

### Prompt Engineering for Game Dev

- **Context Injection**: Use the Seed memory system (.seed/project-memory.json, .seed/notepad.md) to persist important context across sessions. Don't rely on the context window to remember project-specific conventions.
- **Domain Vocabulary**: Be precise with game dev terminology. "Frame rate" vs "tick rate", "rigid body" vs "character controller", "prefab instance" vs "scene object" — ambiguity causes misunderstandings.
- **Reproducibility**: When describing bugs or behaviors, include: Unity version, scene name, reproduction steps, expected vs. actual behavior.

### Workflow Patterns

- **Investigation → Implementation → Verification**: The standard three-phase workflow. Don't skip investigation for complex bugs; don't skip verification for any change.
- **Parallel Independent Work**: If two tasks have no dependencies, assign them to different agents to run in parallel.
- **Checkpoint Before Risk**: Before making high-risk changes, ensure the current state is captured in .seed/notepad.md or a commit.

### Team Coordination

- **Task Board as Truth**: The TaskCreate tasks are the authoritative record of what needs to be done. All changes to scope should be reflected in new tasks.
- **Mailbox for Speed**: Use SendMessage for quick coordination, clarifications, and status updates. Don't create a task for every small question.
- **Leader Decides Direction**: Facts can be distributed (researcher finds info, builder discovers constraints), but direction decisions are centralized in the leader.
