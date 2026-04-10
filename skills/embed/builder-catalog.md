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

1. builder 只能基于当前 `matrix_job.report_file` 写当前 `matrix_job.output_file`。
2. builder 启动后必须先读取 Precondition 指定的单个报告，并向 leader 发送预读确认：`matrix_id`、`confirmed_reports`、`missing_or_invalid_reports`、`covered_researchers`。
3. 若 `missing_or_invalid_reports` 非空，builder 必须暂停生成，等待 leader 对该 `matrix_id` 定向修复。
4. builder 不得把项目外常识补写成项目规范。
5. 同一个矩阵项只能由唯一 builder agent 落笔：
   - 引擎方向 → 使用 `builder-engine` profile 的 `builder-<engine>-<direction-kebab>`
   - capability 方向 → 使用 `builder-common` profile 的 `builder-common-<capability-kebab>`
6. 每个 skill 都必须写新的 frontmatter 契约和 `## 固定问题` 段，且固定问题来自对应 `fixed_question_file`，回答来自 researcher 报告的 `fixed_question_results`。
7. 如果目标矩阵项带有 `confirmed_by_user: true`，builder 必须读取 `user_supplied_evidence`，不能因为 researcher 未重新扫到同一证据就跳过该 skill。
8. 单个 builder 只处理一个 `matrix_id`，不得读取或生成其它矩阵项。
9. 语言层内容必须落在既有矩阵项中：C# 编码约定写入 `<engine>-native-code-architecture.md`；Lua 业务脚本组织写入 `<engine>-script-layer.md`；`common-lua-embedding.md` 只写 runtime / 绑定 / 双向互调 / 热修能力。

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
3. 仍要保留矩阵 frontmatter 字段和 `## 固定问题` 段；能回答的题逐题回答，不能回答的题写明缺失证据

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

### `builder-engine` profile

```text
Task Kind: implement
Expected Owner Role: builder
Agent Name: builder-<engine>-<direction-kebab>
Deliverable: 当前 matrix_job 的单个引擎主线 domain skill，写入 matrix_job.output_file
Done Definition: `matrix_job.output_file` 已按 `matrix_job.report_file` 生成；frontmatter 使用 v2 矩阵字段；必查项缺失或证据不足时只生成占位 skill 并标注 source: incomplete
Dependencies: none
Precondition: 读取 matrix_job.report_file
Startup Requirement: 读取 Precondition 后先向 leader 发送 matrix_id / confirmed_reports / missing_or_invalid_reports / covered_researchers；missing_or_invalid_reports 非空时暂停生成
Risk Level: low
Leader Ack Required: false
Original User Intent: 生成项目专属的单个引擎主线方向 domain skill
Scope Coverage: matrix_job.matrix_id 对应的单个 engine direction
Exclusions: 任何 common-* capability skill
```

### `builder-common` profile

```text
Task Kind: implement
Expected Owner Role: builder
Agent Name: builder-common-<capability-kebab>
Deliverable: 当前 matrix_job 的单个跨引擎能力 domain skill，写入 matrix_job.output_file
Done Definition: `matrix_job.output_file` 已按 `matrix_job.report_file` 生成；frontmatter 使用 v2 矩阵字段；必查项缺失或证据不足时只生成占位 skill 并标注 source: incomplete
Dependencies: none
Precondition: 读取 matrix_job.report_file
Startup Requirement: 读取 Precondition 后先向 leader 发送 matrix_id / confirmed_reports / missing_or_invalid_reports / covered_researchers；missing_or_invalid_reports 非空时暂停生成
Risk Level: low
Leader Ack Required: false
Original User Intent: 生成项目专属的单个跨引擎能力 domain skill
Scope Coverage: matrix_job.matrix_id 对应的单个 capability
Exclusions: 任何 <engine>-* 引擎主线 skill
```

## Builder 写作契约

所有 builder 统一遵守：

```text
根据 Precondition 指定的单个落盘 researcher 报告，为 matrix_job.output_file 生成 domain skill。文件命名、matrix_id、question_set_id、fixed_question_file 和 frontmatter 字段都必须遵守 taxonomy-registry 与 skill-catalog，并且必须与 matrix_job 完全一致。正文只写项目真实命中的实现入口、约定和证据，不得把通用引擎知识写成项目规则。生成文件前，先按 matrix_job.matrix_id 加载对应 fixed question 文件；如果存在匹配的 composite fixed question 文件，再追加加载。`## 固定问题` 不能只列题目，必须逐题写 `Q` 与 `A`：`Q` 来自 fixed question 文件，`A` 来自同一 report 的 `fixed_question_results`。若文件缺失，在 `## 固定问题` 中明确写缺失路径，不得补写猜测问题。若 researcher 报告缺少某题回答，或 question_id/question 与 fixed question 文件不匹配，builder 不得自行推断补答；必须在该题下写 `A: 未回答（researcher 报告缺少或错配 fixed_question_results / 对应 question_id）`，并把 skill 标为 `source: incomplete` 或升级给 leader。
```

## Leader Closeout 模板

```text
Task Kind: closeout
Expected Owner Role: leader
Deliverable: 完成摘要（发给用户）
Done Definition: 已核对所有生成文件是否符合 v2 矩阵命名；占位 skill 已正确标注 source: incomplete；完成摘要中单独列出“正常生成”“占位 skill”“未生成（missing/unsupported）”“必查项缺失 / 需用户补充”“agent 生命周期统计”
Dependencies: 所有 matrix_job 的 builder agent（按实际生成列表）
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
- 每个 matrix_job 和 agent 的创建、修复/补派、builder 预读确认、leader 验收、关闭状态
- 未关闭 agent 及原因
- `Agent ×N` 明显高于计划值时，说明原因是定向补派还是异常重复创建
