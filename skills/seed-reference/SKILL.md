---
name: seed-reference
description: Seed GameDev AI 工作流系统参考指南
---

# Seed Reference

Seed 是一个基于 Claude Code plugin 的游戏研发 AI 工作流系统，提供动态 agent 组装、项目记忆持久化和 skill 注入能力。

## 命令

### /seed:setup
初始化当前项目的 Seed 配置：
- 安装 CLAUDE.md（local 或 global）
- 配置 dispatch 默认模式（auto / confirm / guided）
- 启用 CC native agent teams

### /seed:dispatch
核心命令——分析任务并自动组装 agent team 执行。

用法：
```
/seed:dispatch <任务描述>
/seed:dispatch --auto <任务描述>
/seed:dispatch --confirm <任务描述>
/seed:dispatch --guided <任务描述>
```

执行模式：
- **auto**：分析完直接启动，不打断用户
- **confirm**：展示方案，一次确认后启动（默认）
- **guided**：逐步引导，可手动调整每个参数

系统会自动分析任务的 task_kind（implement / investigate / fix / review / design / operate）、domain 和 complexity，然后查路由表选择最优 agent 组合。

## Agent 角色

| Agent | 职责 | 限制 |
|-------|------|------|
| **leader** | 方向仲裁、计划维护、closeout 签字 | 常驻，不直接实现 |
| **builder** | 实现功能、修复 bug、编写代码 | 方向选择必须升级给 leader |
| **researcher** | 调查、信息收集、根因分析 | 不能写/编辑文件 |
| **reviewer** | 代码审查、方案审查 | 不能写/编辑文件 |
| **unity-pilot** | Unity Editor 操作和实机验证 | 不写 C# 逻辑代码 |

## 升级原则

以下情况 teammate 必须升级给 leader，不得自行决策：
- 实现方案有多个方向可选
- 发现依赖关系变化影响其他任务
- 遇到 Risk Level = high 的情况
- 任何"要不要改这个"的疑问

## 记忆系统

- **项目记忆**：`.seed/project-memory.json` — 长期项目知识（tech stack、hot paths、directives），每次 session 自动注入
- **会话笔记**：`.seed/notepad.md` — 三段式（Priority Context / Working Memory / Manual Notes），Priority 段抗 compact
- **配置**：`.seed/config.json` — 用户偏好（dispatch 模式、记忆设置、context guard 阈值）
- **路由表**：`.seed/team-router.md` — 可项目级定制的 agent 组合路由规则

## 项目级 Skills

在 `.seed/skills/` 下放置 `.md` 文件可以创建项目级 learned skills。文件需包含 YAML frontmatter 的 `triggers` 字段，当用户 prompt 命中触发词时自动注入。
