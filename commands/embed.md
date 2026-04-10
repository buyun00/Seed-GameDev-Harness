---
name: embed
description: 扫描当前项目画像并写入 Seed 项目记忆
argument-hint: "[--check]"
---

# /seed:embed

你正在执行 Seed 的项目画像初始化流程。这个命令会扫描当前项目，并写入 Seed 后续会话需要的基础认知。

**语言**：读取 `.seed/config.json` -> `language`。如果已配置，所有面向用户的输出使用该语言。以下模板为中文示例，请根据配置语言适配。

## 参数

从 `{{ARGUMENTS}}` 中解析：

| 参数 | 行为 |
|---|---|
| 无参数 | 扫描当前项目画像，并覆盖写入 `.seed/project-memory.json` 与 `.seed/project-profile.md` |
| `--check` | 只扫描并展示摘要，不写入任何文件 |

## 开始提示

运行后立即输出：

```text
开始扫描项目画像...
```

## 执行方式

运行项目画像扫描脚本：

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/embed-project-profile.mjs" --cwd "$PWD"
```

如果参数包含 `--check`，追加：

```bash
--check
```

脚本 stdout 是 JSON 摘要。解析后向用户展示摘要。

## 扫描内容

脚本会机械扫描：

- 当前项目主引擎与版本。
- 脚本/代码语言分布。
- 各语言在项目中的作用判断。
- 关键目录地图：路径、用途、证据、置信度。

非 `--check` 模式会写入：

- `.seed/project-memory.json`
- `.seed/project-profile.md`

`--check` 模式只展示摘要，不写文件。

## 完成输出

根据脚本 JSON 摘要输出简短结果：

```markdown
项目画像扫描完成。

- Engine: <engine display>
- Primary language: <primary language>
- Language roles: <language = role; ...>
- Key directories:
  - <path>: <purpose>
  - <path>: <purpose>

已写入：
- `.seed/project-memory.json`
- `.seed/project-profile.md`
```

如果是 `--check`，最后改为：

```markdown
这是 --check 预览，本次没有写入文件。
```

如果脚本失败，直接报告失败命令、错误摘要和下一步建议。
