---
name: setup
description: 为当前项目初始化 Seed
---

# /seed:setup

你正在执行 Seed 设置向导。按以下阶段推进，不要在中途只提问后停住。

## 执行保障

- 如果 `AskUserQuestion` 不可用，立即降级为普通文本提问，并明确告诉用户如何回复。
- 拿到用户输入后继续推进到下一阶段。
- 阶段 3 是静默执行，但静默不等于结束；完成写入后必须继续输出阶段 4 的下一步提示。

## 阶段 1：语言选择

读取 `.seed/config.json`。如果 `language` 已设置且非空，跳过此阶段并告知用户当前语言。

如果 `language` 未设置，使用 `AskUserQuestion` 询问：

```text
选择 Seed 的交互语言（影响所有交互、文档和代码注释）：
```

选项：

- English
- 中文
- 日本語
- 한국어

如果 `AskUserQuestion` 不可用，改为普通文本问题，要求用户直接回复语言名称或编号。

将选择写入 `.seed/config.json` 的 `language` 字段。从这一点开始，后续所有问题、说明和完成摘要都使用选定语言。

## 阶段 2：安装 CLAUDE.md

检查 `{{ARGUMENTS}}` 中是否传入 `--local` 或 `--global`：

- `--local`：安装到当前项目的 `.claude/CLAUDE.md`。
- `--global`：安装到 `~/.claude/CLAUDE.md`。
- 都没有传入：询问用户选择 `local` 或 `global`，推荐 `local`。

然后执行：

```bash
bash "${CLAUDE_PLUGIN_ROOT}/scripts/setup-claude-md.sh" <SCOPE>
```

向用户报告执行结果。

## 阶段 3：写入默认配置与快捷命令

自动执行以下步骤，不再向用户提问。

### 3a. 写入 `.seed/config.json`

如果 `.seed/config.json` 不存在，从 `$CLAUDE_PLUGIN_ROOT/templates/config.json` 复制。

如果已经存在，保留现有内容，不覆盖用户配置。

### 3b. 启用 `/seed` Team 环境变量

读取或创建项目根目录下的 `.claude/settings.json`，确保包含：

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

如果文件已经存在，与现有内容合并，不覆盖其他设置。

### 3c. 创建 `/seed` 项目快捷命令

在项目根目录下创建 `.claude/commands/seed.md`，如果已经存在则跳过。内容为：

```markdown
---
description: Seed 日常入口，转发到 /seed:bud
---

/seed:bud {{ARGUMENTS}}
```

## 阶段 4：引导运行简化 embed

输出以下提示：
```text
✅ Seed 安装完成。

⚠️  请先重启 Claude Code，让配置生效。

重启后运行 /seed:embed 分析项目技术栈，
生成项目专属的 domain skill，让 Seed 更了解你的项目。


✅ Seed 安装完成。
重启后请运行：

  /seed:embed

它会扫描当前项目的引擎、语言分布和目录结构，
写入 .seed/project-memory.json 与 .seed/project-profile.md。
```

如果用户询问 `/seed` 日常入口或 Agent Team，再补充：

```text
如果要使用 /seed 的团队执行能力，请重启 Claude Code，让 Agent Teams 环境变量生效。
```

## 阶段 5：完成标记

将 `setupCompleted` 和当前 ISO 时间戳写入 `.seed/config.json`，保留其他已有字段。
