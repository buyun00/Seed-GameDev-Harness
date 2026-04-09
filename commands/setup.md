---
name: setup
description: 为当前项目初始化 Seed
---

# /seed:setup

你正在执行 Seed 设置向导。按以下四个阶段顺序进行。

## 阶段 1：安装 CLAUDE.md

这是唯一需要用户做决策的步骤。

检查 `{{ARGUMENTS}}` 中是否传入了 `--local` 或 `--global`。

- 如果传入了 `--local`，设置 SCOPE 为 `local`。
- 如果传入了 `--global`，设置 SCOPE 为 `global`。
- 如果都没有传入，使用 `AskUserQuestion` 询问：

"Seed 应该将 CLAUDE.md 指令安装到哪里？"
  - **local** — 本项目的 `.claude/CLAUDE.md`（推荐，只影响当前项目）
  - **global** — `~/.claude/CLAUDE.md`（影响所有项目）

然后执行：

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/setup-claude-md.sh" <SCOPE>
```

向用户报告输出结果。

## 阶段 2：写入默认配置（静默，不询问）

自动执行以下三步，不向用户提问：

### 2a. 写入 `.seed/config.json`

如果 `.seed/config.json` 不存在，从 `$CLAUDE_PLUGIN_ROOT/templates/config.json` 复制。

如果已存在，保留现有内容不覆盖。

**迁移检查**：如果 config 中存在旧的 `dispatch` 键，自动迁移：
1. 将 `dispatch.mode` 的值复制到 `bud.mode`
2. 删除 `dispatch` 键
3. 写回 config 文件

### 2b. 启用 Agent Teams 环境变量

读取或创建项目根目录下的 `.claude/settings.json`，确保包含：

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

如果文件已存在，与现有内容合并 — 不要覆盖其他设置。

### 2c. 创建 `/seed` 项目快捷命令

在项目根目录下创建 `.claude/commands/seed.md`（如果已存在则跳过），内容为：

```markdown
---
description: Seed 日常入口 — 转发到 /seed:bud
---

/seed:bud {{ARGUMENTS}}
```

## 阶段 3：引导运行 /seed:embed

输出以下提示：

```
✅ Seed 安装完成。

⚠️  请先重启 Claude Code，让配置生效。

重启后运行 /seed:embed 分析项目技术栈，
生成项目专属的 domain skill，让 Seed 更了解你的项目。
```

## 阶段 4：完成

将 `setupCompleted` 及当前 ISO 时间戳写入 `.seed/config.json`。

示例：
```json
{
  "setupCompleted": "2025-01-15T10:30:00.000Z"
}
```
