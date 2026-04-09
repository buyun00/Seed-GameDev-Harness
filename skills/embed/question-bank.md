---
name: embed-question-bank
description: /seed:embed Step 2 遗漏项补充题库
triggers:
  - embed step2
  - 遗漏项补充
  - 技术栈问卷
domain:
  - project-analysis
scope:
  - agent-inject
---

## 用途

本文件承接 `/seed:embed` Step 2 的遗漏项补充逻辑。
`embed.md` 只负责判断何时进入 Step 2；具体提问规则与题库都以本文件为准。

## Step 2 目标

Step 2 只负责补充当前 `tech_stack_report` 里仍然缺失的内容：

- Step 1 没检测到、但对后续 skill 生成有影响的分组
- Step 1 冲突未解决、仍然没有答案的分组
- Step 1 自然语言修正后，仍然存在空白或不确定值的分组

禁止：

- 把 Step 1 已确认正确的内容重新做问卷
- 把用户刚刚已经自然语言修正过的字段，再用同一题目确认一次

## 进入 Step 2 前必须建立的分组

- `confirmed_groups`：Step 1 已确认或已通过自然语言修正写回的分组
- `missing_groups`：当前仍为 `none / false / [] / unknown`，且会影响 skill 生成判断的分组
- `unresolved_groups`：冲突仍未解决、或证据不足以决定的分组

只有 `missing_groups` 和 `unresolved_groups` 可以进入 Step 2。
只展示与当前技术栈相关的分组，不相关的跳过。

## 提问文案规则

- 题目统一写成：`{分组名}（当前未检测到或仍不确定，可补充）`
- 如果某个选项有物理证据但在 Step 1 没得到最终确认，可以标注为：`检测到：{evidence}`
- 已在 Step 1 确认过、或已被用户自然语言修正过的选项，不要在 Step 2 再标成默认预选，也不要重复提问
- 每个分组独立提一次，不要把所有缺口混成一题

## 题库

### `lua_bridge`

当 `lua_bridge` 属于 `missing_groups` 或 `unresolved_groups` 时，调用：

```text
AskUserQuestion(
  type: multi_select,
  question: "Lua 桥接方式（当前未检测到或仍不确定，可补充）",
  options: ["xLua", "tolua", "SLua", "自研桥接层", "暂未确定"]
)
```

### `ui_frameworks`

当 `tech_stack_report.engine.name == unity` 且 `ui_frameworks` 属于 `missing_groups` 或 `unresolved_groups` 时，调用：

```text
AskUserQuestion(
  type: multi_select,
  question: "UI 框架（当前未检测到或仍不确定，可补充）",
  options: ["UGUI", "FairyGUI", "UI Toolkit", "自研 UI 框架", "暂未确定"]
)
```

### `hot_update`

当 `tech_stack_report.engine.name == unity` 且 `hot_update` 属于 `missing_groups` 或 `unresolved_groups` 时，调用：

```text
AskUserQuestion(
  type: multi_select,
  question: "热更方案（当前未检测到或仍不确定，可补充）",
  options: ["xLua 热更新", "tolua 热更新", "HybridCLR", "ILRuntime", "无热更需求", "暂未确定"]
)
```

### `asset_management`

当 `tech_stack_report.engine.name == unity` 且 `asset_management` 属于 `missing_groups` 或 `unresolved_groups` 时，调用：

```text
AskUserQuestion(
  type: multi_select,
  question: "资源管理方式（当前未检测到或仍不确定，可补充）",
  options: ["Addressables", "AssetBundle 自管理", "自研资源系统", "暂未确定"]
)
```

### `config_format`

当 `config_format` 属于 `missing_groups` 或 `unresolved_groups` 时，调用：

```text
AskUserQuestion(
  type: multi_select,
  question: "配置表方案（当前未检测到或仍不确定，可补充）",
  options: ["Excel 导出", "Proto / FlatBuffers", "自定义 JSON/YAML", "无配置表", "暂未确定"]
)
```

### `planning_docs`

当 `planning_docs` 属于 `missing_groups` 或 `unresolved_groups` 时，调用：

```text
AskUserQuestion(
  type: multi_select,
  question: "策划文档规范现状（当前未检测到或仍不确定，可补充）",
  options: ["有规范化的文档体系", "有但不规范", "无", "暂未确定"]
)
```

### `network`

当 `network` 属于 `missing_groups` 或 `unresolved_groups` 时，调用：

```text
AskUserQuestion(
  type: multi_select,
  question: "网络层方案（当前未检测到或仍不确定，可补充）",
  options: ["自研网络框架", "Mirror / Netcode", "Godot 内置多人游戏", "无网络需求", "暂未确定"]
)
```

### `godot_extra`

当 `tech_stack_report.engine.name == godot` 且 `godot_extra` 属于 `missing_groups` 或 `unresolved_groups` 时，调用：

```text
AskUserQuestion(
  type: multi_select,
  question: "Godot 项目特有配置（当前未检测到或仍不确定，可补充）",
  options: ["纯 GDScript", "GDScript + C#", "使用 Godot 内置多人游戏", "有导出配置（export_presets.cfg）", "暂未确定"]
)
```

### `unreal_extra`

当 `tech_stack_report.engine.name == unreal` 且 `unreal_extra` 属于 `missing_groups` 或 `unresolved_groups` 时，调用：

```text
AskUserQuestion(
  type: multi_select,
  question: "Unreal 项目特有配置（当前未检测到或仍不确定，可补充）",
  options: ["主要用 Blueprint", "主要用 C++", "Blueprint + C++ 混合", "使用了插件（Plugins/ 目录）", "暂未确定"]
)
```

### `cocos_extra`

当 `tech_stack_report.engine.name == cocos` 且 `cocos_extra` 属于 `missing_groups` 或 `unresolved_groups` 时，调用：

```text
AskUserQuestion(
  type: multi_select,
  question: "Cocos Creator 项目配置（当前未检测到或仍不确定，可补充）",
  options: ["TypeScript", "JavaScript", "微信小游戏平台", "有热更新方案", "暂未确定"]
)
```

### `integrations`

当 `integrations` 属于 `missing_groups` 或 `unresolved_groups` 时，调用：

```text
AskUserQuestion(
  type: multi_select,
  question: "其他集成（当前未检测到或仍不确定，可补充）",
  options: ["MCP 工具集成", "AI pipeline / agent 工作流", "自动化测试框架", "CI/CD 流程", "无"]
)
```

## 退出条件

所有遗漏项问完后直接进入 Step 3，不再对已确认分组追问。
