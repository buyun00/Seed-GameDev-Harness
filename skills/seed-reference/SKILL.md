---
name: seed-reference
description: Seed GameDev AI 工作流系统参考指南
triggers:
  - seed
  - /seed
  - setup
  - embed
  - agent team
  - bud
  - 路由
  - skill 注入
domain:
  - cross-domain
scope:
  - user-chat
  - agent-inject
source: manual
---

# Seed Reference

Seed 是一个基于 Claude Code plugin 的游戏研发 AI 工作流系统，提供动态 agent 组装、项目记忆持久化和 skill 注入能力。

## 命令

### /seed:setup

初始化当前项目的 Seed 配置：

1. 选择交互语言。
2. 安装 CLAUDE.md 到 local 或 global。
3. 写入默认 `.seed/config.json`、Agent Teams 环境变量和 `/seed` 快捷命令。
4. 提示运行 `/seed:embed` 建立项目画像。
5. 写入 setup 完成标记。

### /seed:embed

扫描当前项目画像并写入 Seed 记忆。

用法：

```text
/seed:embed          # 扫描并覆盖当前项目画像
/seed:embed --check  # 只扫描并展示摘要，不写入文件
```

输出文件：

- `.seed/project-memory.json`：供后续 session 自动注入的短项目记忆。
- `.seed/project-profile.md`：供用户审阅的人类可读项目画像。

画像包含：

- 主引擎与版本。
- 脚本/代码语言分布。
- 语言职责判断，例如 Lua 是主要玩法层、C# 是 Unity 宿主/桥接/工具层。
- 关键目录地图：路径、用途、证据、置信度。

### /seed

日常入口命令，分析任务并自动组装 agent team 执行。项目快捷命令由 `/seed:setup` 自动创建，实际转发到 `/seed:bud`。

用法：

```text
/seed <任务描述>
/seed --auto <任务描述>
/seed --confirm <任务描述>
/seed --guided <任务描述>
```

执行模式：

- **auto**：分析后直接启动，不打断用户。
- **confirm**：展示方案，一次确认后启动。
- **guided**：逐步引导，可手动调整参数。

`/seed` 的 Team 能力依赖 Claude Code 的 Agent Teams 环境变量；如果刚运行过 `/seed:setup`，建议重启 Claude Code 后再使用 `/seed`。

## Agent 角色

| Agent | 职责 | 限制 |
|---|---|---|
| leader | 方向仲裁、计划维护、closeout 签字 | 常驻，不直接实现 |
| builder | 实现功能、修复 bug、编写代码 | 方向选择必须升级给 leader |
| researcher | 调查、信息收集、根因分析 | 不能写/编辑文件 |
| reviewer | 代码审查、方案审查 | 不能写/编辑文件 |
| unity-pilot | Unity Editor 操作和实机实验验证 | 不写 C# 逻辑代码 |

## CC Team 消息协议

- 普通文本 `SendMessage` 必须带 `summary` 字段。
- 关闭 teammate 时使用结构化 `shutdown_request` / `shutdown_response`。
- 所有活跃 teammate 退出后再调用 `TeamDelete`。

## 升级原则

以下情况 teammate 必须升级给 leader，不得自行决策：

- 实现方案有多个方向可选。
- 发现依赖关系变化影响其他任务。
- 遇到 Risk Level = high 的情况。
- 任何“要不要改这个”的疑问。

## 记忆系统

- **项目记忆**：`.seed/project-memory.json`，长期项目知识，包括 tech stack、project profile、hot paths、directives 和 recent learnings。
- **项目画像**：`.seed/project-profile.md`，由 `/seed:embed` 生成，面向用户审阅。
- **会话笔记**：`.seed/notepad.md`，三段式 Priority Context / Working Memory / Manual Notes，Priority 段抗 compact。
- **配置**：`.seed/config.json`，用户偏好、bud 模式、embed 画像设置、记忆设置、context guard 阈值。
- **路由表**：`.seed/team-router.md`，可项目级定制 agent 组合路由规则。

## 项目级 Skills

在 `.seed/skills/` 下放置 `.md` 文件可以创建项目级 learned skills。支持子目录，例如 `method/`、`tooling/`。`skill-injector` 会递归扫描，文件需要包含 YAML frontmatter 的 `triggers` 字段。

需要项目级 skill 时，请在 `.seed/skills/` 下添加对应文件。
