---
name: mcp-tools
description: Seed 相关 MCP 工具使用说明（预留）
triggers:
  - mcp
  - server
  - tool_call
  - gamedev-knowledge
---

## Seed MCP Tools

> This skill will be populated when the L2 Knowledge Engine is deployed.
> For now, it serves as a placeholder documenting the planned MCP integration.

### Planned: gamedev-knowledge Server

The `gamedev-knowledge` MCP server will provide:

- **Knowledge Retrieval**: Query game development best practices, engine documentation, and project-specific patterns
- **Code Pattern Search**: Find similar implementations across known game dev codebases
- **API Reference**: Quick lookup for Unity, Lua, and related framework APIs

### Configuration

The MCP server configuration is in `.mcp.json` at the plugin root. After L2 deployment, update the configuration with the actual server endpoint.

### Usage Pattern (Planned)

```
1. Agent identifies a knowledge gap during task execution
2. Agent calls gamedev-knowledge tool with a structured query
3. Server returns relevant documentation, patterns, or examples
4. Agent incorporates the knowledge into their work
```

### Current Workaround

Until the MCP server is available:
- Use project-level skills in `.seed/skills/` for project-specific patterns
- Use built-in skills (unity-patterns, lua-scripting) for common patterns
- Use web search or documentation tools when available
