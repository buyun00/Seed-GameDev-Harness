---
name: mcp-tools
description: Seed 相关 MCP 工具使用说明（预留）
triggers:
  - mcp
  - server
  - tool_call
  - gamedev-knowledge
---

## Seed MCP 工具

> 本 skill 将在 L2 知识引擎部署后填充内容。
> 目前作为占位符，记录计划中的 MCP 集成。

### 计划中：gamedev-knowledge 服务器

`gamedev-knowledge` MCP 服务器将提供：

- **知识检索**：查询游戏开发最佳实践、引擎文档和项目特定模式
- **代码模式搜索**：在已知的游戏开发代码库中查找类似实现
- **API 参考**：快速查阅 Unity、Lua 和相关框架 API

### 配置

MCP 服务器配置在插件根目录的 `.mcp.json` 中。L2 部署后，使用实际的服务器端点更新配置。

### 使用模式（计划中）

```
1. Agent 在任务执行过程中发现知识缺口
2. Agent 使用结构化查询调用 gamedev-knowledge 工具
3. 服务器返回相关的文档、模式或示例
4. Agent 将获取的知识融入工作中
```

### 当前替代方案

在 MCP 服务器可用之前：
- 使用 `.seed/skills/` 中的项目级 skill 获取项目特定模式
- 使用内置 skill（unity-patterns、lua-scripting）获取常见模式
- 在可用时使用网络搜索或文档工具
