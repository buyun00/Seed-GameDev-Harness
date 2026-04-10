---
name: detect-tech-stack
description: 简化项目画像扫描规范，用于 /seed:embed 的本地初始化
triggers:
  - 技术栈检测
  - 引擎识别
  - 项目画像
  - embed
domain:
  - project-analysis
scope:
  - agent-inject
---

# Detect Tech Stack

本文件描述 `/seed:embed` 的项目画像扫描语义。

实际机械扫描由 `$CLAUDE_PLUGIN_ROOT/scripts/embed-project-profile.mjs` 执行。本规范用于解释扫描边界和输出含义。

## 扫描边界

忽略以下目录及其子目录：

- `.git/`
- `.seed/`
- `.claude/`
- `.claude-plugin/`
- `Library/`
- `Temp/`
- `Logs/`
- `Obj/`
- `node_modules/`
- `DerivedDataCache/`

## 引擎检测

按顺序检测：

1. Unity：`ProjectSettings/ProjectVersion.txt`，版本读取 `m_EditorVersion`。
2. Godot：`project.godot`，版本记录 `config_version`。
3. Unreal：项目根目录 `*.uproject`，版本读取 `EngineAssociation`。
4. Cocos：`package.json` 中含 `cocos` 或 `creator`。
5. 均未命中：`engine.name = none`。

## 语言统计

统计以下扩展名：

| Extension | Language |
|---|---|
| `.cs` | C# |
| `.lua` | Lua |
| `.gd` | GDScript |
| `.ts` | TypeScript |
| `.js` | JavaScript |
| `.cpp`, `.h`, `.hpp` | C++ |
| `.py` | Python |

## 语言作用判断

- Unity + Lua + `LuaEnv` / `XLua` / `ToLua` / `LuaInterface` / `SLua` 命中：Lua 视为主要玩法脚本候选，C# 视为 Unity 宿主、桥接、工具层。
- Unity 只有 C#：C# 视为主要 gameplay/runtime 语言。
- Cocos + TypeScript/JavaScript：TS/JS 视为主要 gameplay/runtime 语言。
- Godot + GDScript/C#：按文件数量判断主脚本层。
- Unreal + C++：C++ 视为 native/runtime 层；Blueprint 只作为资产/目录迹象记录，不纳入普通文本语言计数。
- 其他语言存在但无更强证据：标记为 supporting_or_unclassified。

## 目录解析

记录顶层目录，并按引擎额外展开一层关键目录：

- Unity：`Assets/*`、`Packages/`、`ProjectSettings/`
- Cocos：`assets/*`、`settings/`、`extensions/`
- Godot：`addons/`、常见 scene/script 目录
- Unreal：`Source/`、`Content/`、`Config/`、`Plugins/`

每条目录记录包含：

- `path`
- `purpose`
- `evidence`
- `confidence`

默认最多保留 80 条，优先保留引擎根目录、脚本目录、资源目录、配置目录、插件目录、构建/工具目录。

## 输出

`/seed:embed` 写入：

- `.seed/project-memory.json`
- `.seed/project-profile.md`

`/seed:embed --check` 只展示摘要，不写文件。
