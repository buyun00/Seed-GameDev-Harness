---
name: embed-builder-catalog
description: /seed:embed builder 模板、占位 skill 规则与 closeout 契约
triggers:
  - embed builder
  - skill generator
  - closeout
domain:
  - project-analysis
scope:
  - agent-inject
---

## Builder 总约束

所有 builder 只允许基于 researcher 报告生成内容，禁止自行补写项目中未找到的实现。

如果 researcher 报告中出现以下任一情况：

- `必查项缺失错误`
- 只有文档/注释，无实际代码实现
- 明确说明“证据不足，不能写规范”

则 builder 必须：

1. 只生成占位 skill
2. frontmatter 写 `source: incomplete`
3. 正文首段写明：
   - 哪些关键实现未找到
   - researcher 已搜索哪些范围
   - 为什么当前不能补写项目规范
4. 禁止用项目外知识补出默认规范

占位 skill 首段模板：

```text
本文件为占位 skill。
researcher 在项目中未找到以下关键实现：{缺失项列表}。
已搜索范围：{范围列表}。
由于缺少物理证据，本文件暂不写入推断性规范，请结合项目实际实现补充。
```

## Builder TaskCreate 模板

### `builder-unity`

```text
Task Kind: implement
Expected Owner Role: builder
Deliverable: Unity/C# 相关的 domain skill 文件，写入 .seed/skills/domain/
Done Definition: 所有 Step 3 确认的 Unity/C# 相关 skill 文件已创建；若 researcher-unity 报告包含必查项缺失错误，则只生成占位 skill 并标注 source: incomplete
Dependencies: researcher-unity
Risk Level: low
Leader Ack Required: false
Original User Intent: 生成项目专属的 Unity/C# domain skill 文件
Scope Coverage: unity-project-structure, unity-scene-management, unity-lifecycle, unity-prefab-conventions, unity-serialization, csharp-coding-rules, csharp-architecture, csharp-patterns, csharp-async, csharp-testing, ugui-*, fairygui-*, ui-toolkit-*, ilruntime-*
Exclusions: Lua 相关 skill、配置表 skill、基础设施 skill
```

### `builder-lua`

```text
Task Kind: implement
Expected Owner Role: builder
Deliverable: Lua 相关的 domain skill 文件，写入 .seed/skills/domain/
Done Definition: 所有 Step 3 确认的 Lua 相关 skill 文件已创建；若 researcher-lua 报告包含必查项缺失错误，则只生成占位 skill 并标注 source: incomplete
Dependencies: researcher-lua
Risk Level: low
Leader Ack Required: false
Original User Intent: 生成项目专属的 Lua domain skill 文件
Scope Coverage: lua-architecture, lua-coding-rules, lua-module-system, lua-gameplay-api, lua-error-handling, xlua-bridge-rules, xlua-hotfix-patterns, xlua-interop-conventions, tolua-*
Exclusions: C# 层 skill、Unity 编辑器 skill
```

### `builder-config`

```text
Task Kind: implement
Expected Owner Role: builder
Deliverable: 配置/策划相关的 domain skill 文件，写入 .seed/skills/domain/
Done Definition: 所有 Step 3 确认的配置/策划相关 skill 文件已创建，内容仅基于 researcher-config 报告
Dependencies: researcher-config
Risk Level: low
Leader Ack Required: false
Original User Intent: 生成项目专属的配置和策划 domain skill 文件
Scope Coverage: config-schema, config-workflow, config-validation, design-document-format, design-review-process
Exclusions: 运行时代码 skill、基础设施 skill
```

### `builder-infra`

```text
Task Kind: implement
Expected Owner Role: builder
Deliverable: 基础设施相关的 domain skill 文件，写入 .seed/skills/domain/
Done Definition: 所有 Step 3 确认的基础设施相关 skill 文件已创建（含 project-structure 和 project-conventions）；若 researcher-infra 报告包含必查项缺失错误，则只生成占位 skill 并标注 source: incomplete
Dependencies: researcher-infra
Risk Level: low
Leader Ack Required: false
Original User Intent: 生成项目专属的基础设施 domain skill 文件
Scope Coverage: project-structure, project-conventions, addressables-organization, addressables-loading, network-protocol, network-error-handling, mcp-integration, ai-pipeline-conventions, agent-collaboration
Exclusions: 游戏逻辑 skill、Lua 层 skill
```

### `builder-godot`

```text
Task Kind: implement
Expected Owner Role: builder
Deliverable: Godot 相关的 domain skill 文件，写入 .seed/skills/domain/
Done Definition: 所有 Step 3 确认的 Godot 相关 skill 文件已创建；若 researcher-godot 报告包含必查项缺失错误，则只生成占位 skill 并标注 source: incomplete
Dependencies: researcher-godot
Risk Level: low
Leader Ack Required: false
Original User Intent: 生成项目专属的 Godot domain skill 文件
Scope Coverage: godot-project-structure, godot-scene-conventions, godot-signals, gdscript-coding-rules
Exclusions: 非 Godot 引擎相关 skill
```

### `builder-unreal`

```text
Task Kind: implement
Expected Owner Role: builder
Deliverable: Unreal 相关的 domain skill 文件，写入 .seed/skills/domain/
Done Definition: 所有 Step 3 确认的 Unreal 相关 skill 文件已创建；若 researcher-unreal 报告包含必查项缺失错误，则只生成占位 skill 并标注 source: incomplete
Dependencies: researcher-unreal
Risk Level: low
Leader Ack Required: false
Original User Intent: 生成项目专属的 Unreal domain skill 文件
Scope Coverage: unreal-project-structure, unreal-blueprint-conventions, unreal-cpp-coding-rules, unreal-gameplay-framework
Exclusions: 非 Unreal 引擎相关 skill
```

### `builder-cocos`

```text
Task Kind: implement
Expected Owner Role: builder
Deliverable: Cocos Creator 相关的 domain skill 文件，写入 .seed/skills/domain/
Done Definition: 所有 Step 3 确认的 Cocos 相关 skill 文件已创建；若 researcher-cocos 报告包含必查项缺失错误，则只生成占位 skill 并标注 source: incomplete
Dependencies: researcher-cocos
Risk Level: low
Leader Ack Required: false
Original User Intent: 生成项目专属的 Cocos Creator domain skill 文件
Scope Coverage: cocos-project-structure, cocos-component-conventions, cocos-typescript-rules, cocos-hotupdate
Exclusions: 非 Cocos 引擎相关 skill
```

## Builder 指令

所有 builder 统一遵守：

```text
根据对应 researcher 的报告，生成对应的 skill 文件。
每个文件必须包含 YAML frontmatter（name, description, triggers, domain, scope, source）和正文内容。
source 字段：有充分证据填 "scanned"；信息不完整、存在必查项缺失错误或未找到实现时填 "incomplete"。
如果 researcher 报告中有必查项缺失错误，只能生成占位 skill，不得补写推断性规范。
如报告中发现了原 catalog 未列出的项目特有约定，可以补充生成对应 skill 文件。
```

## Leader Closeout 模板

```text
Task Kind: closeout
Expected Owner Role: leader
Deliverable: 完成摘要（发送给用户）
Done Definition: 所有 skill 文件已检查；内容不完整的已标注 source: incomplete；完成摘要中单独列出“必查项缺失 / 需用户补充”区块
Dependencies: 所有实际派出的 builder（根据引擎和技术栈动态决定，如 builder-unity, builder-lua, builder-godot 等）
Risk Level: low
Leader Ack Required: true
Original User Intent: 确认所有 domain skill 文件已正确生成
Scope Coverage: 全部生成的 skill 文件
Exclusions: 无
```

Leader 指令：

```text
- 检查所有 skill 文件是否已生成
- 内容不完整的文件标注 source: incomplete
- 整理完成摘要（成功 / 占位 / 失败列表）
- 单独整理“必查项缺失 / 需用户补充”区块
- TeamDelete("seed-embed")
```
