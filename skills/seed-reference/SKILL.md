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
初始化当前项目的 Seed 配置（五阶段）：
1. 语言选择（影响所有后续交互）
2. 安装 CLAUDE.md（local 或 global）
3. 静默写入默认配置（config.json、agent teams、快捷命令）
4. 引导运行 /seed:embed
5. 写入完成标记

### /seed:embed
按双轴矩阵分析项目技术栈，生成项目专属 domain skill。可随时重跑。

用法：
```
/seed:embed            # 全量模式：重新生成所有 domain skill
/seed:embed --update   # 增量模式：只生成缺失的 skill，已有文件保留
```

流程：扫描项目结构 → 确认主引擎与矩阵项 → 补问未确认方向 → 确认文件列表 → Agent Team 并行生成 → 输出完成摘要。

生成的 skill 文件存放在 `.seed/skills/domain/`，命名统一为 `domain/<engine>-<direction>.md` 或 `domain/common-<capability>.md`。

### /seed
日常入口命令——分析任务并自动组装 agent team 执行（项目快捷命令，由 `/seed:setup` 自动创建，转发到 `/seed:bud`）。

用法：
```
/seed <任务描述>
/seed --auto <任务描述>
/seed --confirm <任务描述>
/seed --guided <任务描述>
```

执行模式：
- **auto**：分析完直接启动，不打断用户（默认）
- **confirm**：展示方案，一次确认后启动
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

## CC Team 消息协议

- 普通文本 `SendMessage` 必须带 `summary` 字段。
- 关闭 teammate 时使用结构化 `shutdown_request` / `shutdown_response`，不要用普通文本模拟关闭。
- 所有活跃 teammate 退出后再调用 `TeamDelete`；`TeamDelete` 不接收 `team_name`、`message` 或最终摘要，最终摘要在删除成功后输出给用户。

## 升级原则

以下情况 teammate 必须升级给 leader，不得自行决策：
- 实现方案有多个方向可选
- 发现依赖关系变化影响其他任务
- 遇到 Risk Level = high 的情况
- 任何"要不要改这个"的疑问

## 记忆系统

- **项目记忆**：`.seed/project-memory.json` — 长期项目知识（tech stack、hot paths、directives），每次 session 自动注入
- **会话笔记**：`.seed/notepad.md` — 三段式（Priority Context / Working Memory / Manual Notes），Priority 段抗 compact
- **配置**：`.seed/config.json` — 用户偏好（bud 模式、记忆设置、context guard 阈值）
- **路由表**：`.seed/team-router.md` — 可项目级定制的 agent 组合路由规则

## 项目级 Skills

在 `.seed/skills/` 下放置 `.md` 文件可以创建项目级 learned skills。支持子目录（如 `domain/`、`method/`、`tooling/`），skill-injector 会递归扫描。文件需包含 YAML frontmatter 的 `triggers` 字段，当用户 prompt 命中触发词时自动注入。

运行 `/seed:embed` 可自动生成项目专属的矩阵化 domain skill 到 `.seed/skills/domain/`。
