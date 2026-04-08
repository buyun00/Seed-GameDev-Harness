---
name: setup
description: 为当前项目初始化 Seed
---

# /seed:setup

你正在执行 Seed 设置向导。按以下阶段顺序进行。

## 阶段 0：语言选择

读取 `.seed/config.json`。如果 `language` 已设置且非空，跳过此阶段并告知用户当前语言。

如果 `language` 未设置（空字符串或缺失），使用 `AskUserQuestion` 询问用户：

"选择 Seed 的交互语言（影响所有交互、文档和代码注释）："
- **English** — 英语
- **中文** — 中文
- **日本語** — 日语
- **한국어** — 韩语

将选择的值（如 `"English"`、`"中文"`、`"日本語"`、`"한국어"`）写入 `.seed/config.json` 的 `language` 字段。

**从这一点开始，整个设置向导使用选定的语言进行。** 后续所有问题、说明和完成摘要都必须使用选定的语言。

## 阶段 1：安装 CLAUDE.md

检查 `{{ARGUMENTS}}` 中是否传入了 `--local` 或 `--global`。

- 如果传入了 `--local`，设置 SCOPE 为 `local`。
- 如果传入了 `--global`，设置 SCOPE 为 `global`。
- 如果都没有传入，询问用户：

使用 `AskUserQuestion`：
- "Seed 应该将 CLAUDE.md 指令安装到哪里？"
  - **local** — 本项目的 `.claude/CLAUDE.md`（推荐用于单项目配置）
  - **global** — `~/.claude/CLAUDE.md`（适用于所有项目）

然后执行：

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/setup-claude-md.sh" <SCOPE>
```

向用户报告输出结果。

## 阶段 2：配置 dispatch 模式

读取 `.seed/config.json`。如果 `dispatch.mode` 已设置，跳过此阶段并告知用户当前模式。

如果 `dispatch.mode` 未设置，使用 `AskUserQuestion` 询问用户：

"`/seed:dispatch` 应该如何处理团队组装？"
- **auto** — 分析后直接启动，无需确认
- **confirm** — 展示方案，一次确认后启动（推荐）
- **guided** — 逐步引导，可调整每个参数

将选择的模式写入 `.seed/config.json` 的 `dispatch.mode`。

## 阶段 3：启用 Agent Teams

使用 `AskUserQuestion` 询问用户：

"是否启用 CC 原生 agent teams？这是 `/seed:dispatch` 正常工作的必要条件。"
- **是** — 启用（推荐）
- **否** — 暂时跳过

如果用户确认，读取或创建项目根目录下的 `.claude/settings.json`，确保包含：

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

如果文件已存在，与现有内容合并 — 不要覆盖其他设置。

## 阶段 4：完成

将 `setupCompleted` 及当前 ISO 时间戳写入 `.seed/config.json`。

输出完成摘要：

```
Seed 设置完成！

  CLAUDE.md:  已安装（{SCOPE}）
  Dispatch:   {mode} 模式
  Teams:      {已启用/未启用}

重启 Claude Code 以使所有配置生效。

快速开始：
  /seed:dispatch <描述你的任务>
```
