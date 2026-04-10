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

# /seed:embed Builder Catalog

本文件负责 Step 4 的 builder 任务模板、占位 skill 规则和 leader closeout 契约。执行前必须先加载 [`$CLAUDE_PLUGIN_ROOT/skills/embed/taxonomy-registry.md`]($CLAUDE_PLUGIN_ROOT/skills/embed/taxonomy-registry.md) 和 [`$CLAUDE_PLUGIN_ROOT/skills/embed/skill-catalog.md`]($CLAUDE_PLUGIN_ROOT/skills/embed/skill-catalog.md)。

## Builder 总约束

1. builder 只能基于对应 researcher 的调查报告写 skill。
2. builder 不得把项目外常识补写成项目规范。
3. 同一个矩阵项只能由唯一 builder 落笔：
   - 引擎方向 → 对应 `builder-<engine>`
   - `lua_embedding` → `builder-lua`
   - `data_config_pipeline` → `builder-config`
   - `network_protocol_and_sync` / `build_release_and_cicd` / `tooling_and_ai_pipeline` → `builder-infra`
4. 每个 skill 都必须写新的 frontmatter 契约和 `## 固定问题` 段，且固定问题来自对应 `fixed_question_file`。
5. 如果目标矩阵项带有 `confirmed_by_user: true`，builder 必须读取 `user_supplied_evidence`，不能因为 researcher 未重新扫到同一证据就跳过该 skill。

## 占位 skill 规则

如果 researcher 报告中出现任一情况，builder 只能生成占位 skill：

- `必查项缺失错误`
- 只有目录/依赖命中，没有实际实现入口
- 只能确认某方案“存在”，无法确认项目如何使用
- 明确写出“证据不足，不能生成项目级约定”

### 占位 skill 要求

1. frontmatter 写 `source: incomplete`
2. 正文首段必须明确：
   - 缺失了哪些关键实现
   - researcher 搜了哪些范围
   - 为什么当前不能把它写成项目规范
3. 仍要保留矩阵 frontmatter 字段和 `## 固定问题` 段

### 用户补全 skill 要求

如果矩阵项由用户补全进入生成列表：

- 用户提供了路径、目录、文件名、类名、函数名、配置项或关键字符串时，frontmatter 可写 `source: user-confirmed`，正文 `## 证据` 必须列出 `user_supplied_evidence`。
- 用户只提供方案名或自然语言描述、但没有具体落点时，仍要生成 skill；如果 researcher 也未找到实现入口，则写 `source: incomplete` 并说明待补的具体证据。
- 用户明确确认不存在的 `missing` 项不应进入 builder 目标列表。

占位 skill 首段模板：

```text
本文件为占位 skill。researcher 在项目中未找到以下关键实现：{缺失项列表}。已搜索范围：{范围列表}。由于缺少可回溯的物理证据，当前无法把该矩阵方向写成项目级约定，请结合实际实现补充。
```

## Builder 任务模板

### `builder-unity`

```text
Task Kind: implement
Expected Owner Role: builder
Deliverable: 当前项目的 Unity 引擎主线 domain skill 文件，写入 .seed/skills/domain/
Done Definition: 所有目标 Unity 矩阵项均已生成 `domain/unity-*.md`；frontmatter 使用 v2 矩阵字段；如 researcher-unity 报告含必查项缺失错误，则对应文件只生成占位 skill 并标注 source: incomplete
Dependencies: researcher-unity
Risk Level: low
Leader Ack Required: false
Original User Intent: 生成项目专属的 Unity 主线方向 domain skill
Scope Coverage: project_structure, scene_graph_and_lifecycle, native_code_architecture, script_layer, bridge_layer, ui_system, hot_reload, asset_pipeline, event_and_message_system, animation_system, physics_navigation_or_runtime_framework, plugin_extension, platform_adaptation
Exclusions: common-lua-embedding、common-data-config-pipeline、common-network-protocol-and-sync、common-build-release-and-cicd、common-tooling-and-ai-pipeline
```

### `builder-godot`

```text
Task Kind: implement
Expected Owner Role: builder
Deliverable: 当前项目的 Godot 引擎主线 domain skill 文件，写入 .seed/skills/domain/
Done Definition: 所有目标 Godot 矩阵项均已生成 `domain/godot-*.md`；frontmatter 使用 v2 矩阵字段；如 researcher-godot 报告含必查项缺失错误，则对应文件只生成占位 skill 并标注 source: incomplete
Dependencies: researcher-godot
Risk Level: low
Leader Ack Required: false
Original User Intent: 生成项目专属的 Godot 主线方向 domain skill
Scope Coverage: project_structure, scene_graph_and_lifecycle, native_code_architecture, script_layer, bridge_layer, ui_system, hot_reload, asset_pipeline, event_and_message_system, animation_system, physics_navigation_or_runtime_framework, plugin_extension, platform_adaptation
Exclusions: common-lua-embedding、common-data-config-pipeline、common-network-protocol-and-sync、common-build-release-and-cicd、common-tooling-and-ai-pipeline
```

### `builder-unreal`

```text
Task Kind: implement
Expected Owner Role: builder
Deliverable: 当前项目的 Unreal 引擎主线 domain skill 文件，写入 .seed/skills/domain/
Done Definition: 所有目标 Unreal 矩阵项均已生成 `domain/unreal-*.md`；frontmatter 使用 v2 矩阵字段；如 researcher-unreal 报告含必查项缺失错误，则对应文件只生成占位 skill 并标注 source: incomplete
Dependencies: researcher-unreal
Risk Level: low
Leader Ack Required: false
Original User Intent: 生成项目专属的 Unreal 主线方向 domain skill
Scope Coverage: project_structure, scene_graph_and_lifecycle, native_code_architecture, script_layer, bridge_layer, ui_system, hot_reload, asset_pipeline, event_and_message_system, animation_system, physics_navigation_or_runtime_framework, plugin_extension, platform_adaptation
Exclusions: common-lua-embedding、common-data-config-pipeline、common-network-protocol-and-sync、common-build-release-and-cicd、common-tooling-and-ai-pipeline
```

### `builder-cocos`

```text
Task Kind: implement
Expected Owner Role: builder
Deliverable: 当前项目的 Cocos 引擎主线 domain skill 文件，写入 .seed/skills/domain/
Done Definition: 所有目标 Cocos 矩阵项均已生成 `domain/cocos-*.md`；frontmatter 使用 v2 矩阵字段；如 researcher-cocos 报告含必查项缺失错误，则对应文件只生成占位 skill 并标注 source: incomplete
Dependencies: researcher-cocos
Risk Level: low
Leader Ack Required: false
Original User Intent: 生成项目专属的 Cocos 主线方向 domain skill
Scope Coverage: project_structure, scene_graph_and_lifecycle, native_code_architecture, script_layer, bridge_layer, ui_system, hot_reload, asset_pipeline, event_and_message_system, animation_system, physics_navigation_or_runtime_framework, plugin_extension, platform_adaptation
Exclusions: common-lua-embedding、common-data-config-pipeline、common-network-protocol-and-sync、common-build-release-and-cicd、common-tooling-and-ai-pipeline
```

### `builder-lua`

```text
Task Kind: implement
Expected Owner Role: builder
Deliverable: 当前项目的 Lua 跨引擎能力 skill 文件，写入 .seed/skills/domain/
Done Definition: 若目标列表包含 capability.lua_embedding，则生成 `domain/common-lua-embedding.md`；frontmatter 使用 v2 矩阵字段；如 researcher-lua 报告含必查项缺失错误，则只生成占位 skill 并标注 source: incomplete
Dependencies: researcher-lua
Risk Level: low
Leader Ack Required: false
Original User Intent: 生成项目专属的 Lua 跨引擎嵌入 skill
Scope Coverage: lua_embedding
Exclusions: 任意引擎主线方向、配置表、网络、CI/CD、工具链
```

### `builder-config`

```text
Task Kind: implement
Expected Owner Role: builder
Deliverable: 当前项目的数据配置能力 skill 文件，写入 .seed/skills/domain/
Done Definition: 若目标列表包含 capability.data_config_pipeline，则生成 `domain/common-data-config-pipeline.md`；frontmatter 使用 v2 矩阵字段；如 researcher-config 明确证据不足，则只生成占位 skill 并标注 source: incomplete
Dependencies: researcher-config
Risk Level: low
Leader Ack Required: false
Original User Intent: 生成项目专属的数据配置与导表能力 skill
Scope Coverage: data_config_pipeline
Exclusions: 任意引擎主线方向、Lua、网络、CI/CD、工具链
```

### `builder-infra`

```text
Task Kind: implement
Expected Owner Role: builder
Deliverable: 当前项目的基础设施能力 skill 文件，写入 .seed/skills/domain/
Done Definition: 目标列表中的 `domain/common-network-protocol-and-sync.md`、`domain/common-build-release-and-cicd.md`、`domain/common-tooling-and-ai-pipeline.md` 均已按 researcher-infra 报告生成；frontmatter 使用 v2 矩阵字段；证据不足的项只生成占位 skill 并标注 source: incomplete
Dependencies: researcher-infra
Risk Level: low
Leader Ack Required: false
Original User Intent: 生成项目专属的跨引擎基础设施能力 skill
Scope Coverage: network_protocol_and_sync, build_release_and_cicd, tooling_and_ai_pipeline
Exclusions: 任意引擎主线方向、Lua、配置表
```

## Builder 写作契约

所有 builder 统一遵守：

```text
根据对应 researcher 的调查报告，为目标矩阵项生成 domain skill。文件命名、matrix_id、question_set_id、fixed_question_file、owner、frontmatter 字段都必须遵守 taxonomy-registry 与 skill-catalog。正文只写项目真实命中的实现入口、约定和证据，不得把通用引擎知识写成项目规则。生成每个文件前，先按 matrix_id 加载对应 fixed question 文件；如果存在匹配的 composite fixed question 文件，再追加加载。若文件缺失，在 `## 固定问题` 中明确写缺失路径，不得补写猜测问题。
```

## Leader Closeout 模板

```text
Task Kind: closeout
Expected Owner Role: leader
Deliverable: 完成摘要（发给用户）
Done Definition: 已核对所有生成文件是否符合 v2 矩阵命名；占位 skill 已正确标注 source: incomplete；完成摘要中单独列出“正常生成”“占位 skill”“未生成（missing/unsupported）”“必查项缺失 / 需用户补充”
Dependencies: 所有实际派出的 builder
Risk Level: low
Leader Ack Required: true
Original User Intent: 确认所有 domain skill 已按双轴矩阵正确生成
Scope Coverage: 本次全部生成文件
Exclusions: 无
```

Leader 摘要必须单独列出：

- 正常生成的矩阵项
- 占位 skill
- 因 `missing` 或 `unsupported` 未生成的矩阵项
- researcher 报告中的 `必查项缺失错误`
