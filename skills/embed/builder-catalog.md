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

1. builder 只能基于对应落盘 researcher 报告写 skill。
2. builder 不得把项目外常识补写成项目规范。
3. 同一个矩阵项只能由唯一 builder 落笔：
   - 引擎方向 → `builder-engine`
   - `lua_embedding` / `data_config_pipeline` / `network_protocol_and_sync` / `build_release_and_cicd` / `tooling_and_ai_pipeline` → `builder-common`
4. 每个 skill 都必须写新的 frontmatter 契约和 `## 固定问题` 段，且固定问题来自对应 `fixed_question_file`。
5. 如果目标矩阵项带有 `confirmed_by_user: true`，builder 必须读取 `user_supplied_evidence`，不能因为 researcher 未重新扫到同一证据就跳过该 skill。
6. 单个 builder 必须按报告内容为每个 `matrix_id` 独立迭代，不得把多个矩阵项混在一个文件里写。

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

### `builder-engine`

```text
Task Kind: implement
Expected Owner Role: builder
Deliverable: 当前项目所有激活引擎主线方向的 domain skill 文件，写入 .seed/skills/domain/
Done Definition: 所有目标 `domain/<engine>-*.md`（含 unity/godot/unreal/cocos 中激活的引擎）均已按对应 researcher 报告生成；frontmatter 使用 v2 矩阵字段；必查项缺失或证据不足的矩阵项只生成占位 skill 并标注 source: incomplete
Dependencies: none
Precondition: 读取 .seed/state/embed/<embed_stamp>/reports/ 下所有 researcher-{unity,godot,unreal,cocos}.yaml 中实际存在的报告
Risk Level: low
Leader Ack Required: false
Original User Intent: 生成项目专属的引擎主线方向 domain skill
Scope Coverage: 所有激活引擎的 13 个方向（project_structure, scene_graph_and_lifecycle, native_code_architecture, script_layer, bridge_layer, ui_system, hot_reload, asset_pipeline, event_and_message_system, animation_system, physics_navigation_or_runtime_framework, plugin_extension, platform_adaptation）
Exclusions: 任何 common-* capability skill
```

### `builder-common`

```text
Task Kind: implement
Expected Owner Role: builder
Deliverable: 当前项目所有激活跨引擎能力的 domain skill 文件，写入 .seed/skills/domain/
Done Definition: 所有目标 `domain/common-*.md`（lua/config/network/build/tooling 中激活的能力）均已按对应 researcher 报告生成；frontmatter 使用 v2 矩阵字段；必查项缺失或证据不足的矩阵项只生成占位 skill 并标注 source: incomplete
Dependencies: none
Precondition: 读取 .seed/state/embed/<embed_stamp>/reports/ 下所有 researcher-{lua,config,infra}.yaml 中实际存在的报告
Risk Level: low
Leader Ack Required: false
Original User Intent: 生成项目专属的跨引擎能力 domain skill
Scope Coverage: lua_embedding, data_config_pipeline, network_protocol_and_sync, build_release_and_cicd, tooling_and_ai_pipeline
Exclusions: 任何 <engine>-* 引擎主线 skill
```

## Builder 写作契约

所有 builder 统一遵守：

```text
根据 Precondition 指定的落盘 researcher 报告，为目标矩阵项生成 domain skill。文件命名、matrix_id、question_set_id、fixed_question_file、owner、frontmatter 字段都必须遵守 taxonomy-registry 与 skill-catalog。正文只写项目真实命中的实现入口、约定和证据，不得把通用引擎知识写成项目规则。生成每个文件前，先按 matrix_id 加载对应 fixed question 文件；如果存在匹配的 composite fixed question 文件，再追加加载。若文件缺失，在 `## 固定问题` 中明确写缺失路径，不得补写猜测问题。
```

## Leader Closeout 模板

```text
Task Kind: closeout
Expected Owner Role: leader
Deliverable: 完成摘要（发给用户）
Done Definition: 已核对所有生成文件是否符合 v2 矩阵命名；占位 skill 已正确标注 source: incomplete；完成摘要中单独列出“正常生成”“占位 skill”“未生成（missing/unsupported）”“必查项缺失 / 需用户补充”
Dependencies: builder-engine, builder-common（按激活情况）
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
