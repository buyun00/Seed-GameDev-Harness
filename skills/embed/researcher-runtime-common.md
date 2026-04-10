---
name: embed-researcher-runtime-common
description: /seed:embed 运行时 researcher 固定问题缺失报错协议
triggers:
  - embed runtime researcher
  - fixed question runtime
  - 运行时调查
domain:
  - project-analysis
scope:
  - agent-inject
---

## 适用范围

按 `taxonomy-registry.md` 的双轴矩阵，本文件服务的是“需要用运行时缺失协议回答固定问题”的 owner，而不是“所有与运行时相关的分类”。

本文件只定义搜索与缺失处理协议，不再提供固定问题正文。固定问题必须从 `$CLAUDE_PLUGIN_ROOT/skills/embed/fixed-questions/` 下的矩阵项文件加载。

### 引擎主线 owner

- `researcher-unity`
- `researcher-godot`
- `researcher-unreal`
- `researcher-cocos`

### 跨引擎能力 owner

- `researcher-lua`

说明：

- `researcher-lua` 属于 capability owner，不是 engine owner。
- 它加载本文件，不代表它与 Unity / Godot / Unreal / Cocos 属于同一分类层级；只代表 Lua 嵌入能力经常承载运行时实现路径，遇到 fixed question 中的强制项时必须按同一硬约束输出证据。
- `researcher-config` 不加载本文件。
- `researcher-infra` 也不加载本文件；基础设施能力改由独立 capability researcher 处理，不再承担引擎运行时主线固定问题。

## 固定问题来源

运行时相关问题只能来自以下文件：

- 引擎主线 owner：按当前引擎与 `matrix_id` 加载 `fixed-questions/engine/<engine>/<direction-kebab>.md`
- capability owner：按当前能力加载 `fixed-questions/capability/<capability-kebab>.md`
- 如存在匹配叠加项，再追加加载 `fixed-questions/composite/<engine>/<direction-kebab>/<capability-kebab>.md`

约束：

- 不得把旧版硬编码题目或本文件中的搜索线索当作额外固定问题。
- 不得在 researcher 脚本里临时发明问题正文。
- 如果领域剧本与固定问题冲突，以 fixed-questions 文件为准。
- `must_find: true` 表示必须认真搜索并逐题回答。
- `fatal_if_missing: true` 表示扩大搜索后仍无实际实现时，必须输出 `必查项缺失错误`。

## 搜索流程

### 第一轮：定向搜索

先读取已加载固定问题里的 `search_hints.paths` 与 `search_hints.keywords`，按题目逐一搜索。优先关注项目自己的封装层与最终调用落点。

如固定问题没有给出足够线索，可补充使用高价值目录名、类型名、方法名、文件名，但这些补充线索只用于搜索，不得变成新增固定问题。

常见补充线索包括：`UI`、`Panel`、`Window`、`Scene`、`Level`、`Asset`、`Resource`、`Event`、`Message`、`Manager`、`Service`、`Controller`、`Loader`、`Pool`。

### 第二轮：追实现

命中后必须继续追踪到实际实现：

- 从框架 API、目录名或配置项追到项目自己的封装层
- 从抽象入口追到最终调用点
- 从资源、场景、UI、事件或脚本线索追到实际加载、注册、派发、实例化、释放或清理代码
- 从 capability 线索追到引擎宿主入口与能力自身入口

如果只停在接口、抽象基类、常量、命名约定，不算完成。

### 第三轮：扩大搜索

第一轮未定位到实现时，必须扩大到全仓库继续查。

扩大搜索时要：

- 保留已搜目录与关键词列表
- 排除明显三方、缓存、生成目录，包括 `.seed/`、`.claude/`、`.claude-plugin/`
- 优先查项目根下的脚本目录、运行时目录、工具目录、编辑器目录、配置目录

## 缺失处理

扩大搜索后仍找不到某道 `fatal_if_missing: true` 固定问题的实际实现时：

1. 不允许把该项写成 `incomplete` 就结束
2. 必须输出 `必查项缺失错误`
3. 错误中必须包含：
   - `question_id`
   - `question`
   - `fixed_question_file`
   - 已搜索范围
   - 已搜索关键词
   - 为什么仍无法确认实现
4. 明确告诉 builder：该方向只能生成占位 skill，不得补写推断性规则

对于 `must_find: true` 但 `fatal_if_missing: false` 的固定问题，扩大搜索后仍找不到实际实现时，状态写 `not_found`，并保留已搜索范围、关键词和 builder 提示。

## 固定问题输出格式

每道固定问题都写入 `fixed_question_results`，并沿用 `researcher-common.md` 的结构。运行时缺失协议只要求补充 `error_type` 与明确的 builder 提示：

```yaml
fixed_question_results:
  - matrix_id: "engine.<engine>.<direction_id>"
    fixed_question_file: "$CLAUDE_PLUGIN_ROOT/skills/embed/fixed-questions/engine/<engine>/<direction-kebab>.md"
    composite_fixed_question_files: []
    questions:
      - question_id: "<id from fixed question file>"
        question: "<question text from fixed question file>"
        status: error
        error_type: "必查项缺失错误"
        evidence_paths: []
        matched_strings: []
        implementation: []
        searched_scopes:
          - "<searched path or glob>"
        searched_keywords:
          - "<searched keyword>"
        answer: "扩大到全仓库后仍未找到可确认的实际实现。"
        builder_note: "该方向只能生成占位 skill，不得补写推断性规则。"
```

## Builder 协议

如果报告里存在任意 `必查项缺失错误`：

- builder 只能生成占位 skill
- `source` 必须写 `incomplete`
- 正文首段必须明确写出缺失项与已搜索范围
- 禁止 builder 用项目外知识补写默认规范
