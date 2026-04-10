---
name: embed
description: 分析项目技术栈，按双轴矩阵生成项目专属 domain skill
argument-hint: "[--update]"
---

# /seed:embed

你正在执行 Seed 的项目技术栈分析与 domain skill 生成流程。

**语言**：读取 `.seed/config.json` → `language`。如果已设置，所有面向用户的输出使用配置的语言。以下模板为中文示例，请根据配置语言适配。

## Flag 解析

从 `{{ARGUMENTS}}` 中检查是否包含 `--update`：

| Flag | 行为 |
|---|---|
| 无 flag | **全量模式**：重新生成本次矩阵结果对应的所有 domain skill，已有文件允许覆盖 |
| `--update` | **增量模式**：只生成缺失的 skill，已有文件保留不覆盖 |

## 启动提示

运行后立即输出：

```text
开始分析项目技术栈...

⏳ Seed 将先扫描项目结构，再按双轴矩阵整理：
   - 引擎主线方向
   - 跨引擎能力方向
随后会请你确认，再生成项目专属 domain skill。
请耐心等待，不要中断。
```

---

## 执行保障（必须遵守）

- **Step 0 只是静默扫描，不是流程终点。** 扫描后必须在同一轮内立刻进入 Step 1。
- 如果当前环境**不支持** `AskUserQuestion`，必须降级为普通文本提问，并明确告诉用户如何回复。
- 每到需要用户输入的节点，都要明确写出“你现在需要回复什么”。
- 如果 `tech_stack_report.conflicts` 非空，Step 1 必须明确展示冲突项，不得自行裁决。
- 如果环境不能使用 `TeamCreate` / `TaskCreate` / `SendMessage`，必须直接报错尝试修复，修不了停掉流程告诉用户，不能兜底。
- `/seed:embed` 相关外置 skill 是执行规范，不是参考资料；加载后必须按其规则执行。
- 插件内置命令、skill、fixed question 一律从 `$CLAUDE_PLUGIN_ROOT/skills/` 解析；`.seed/skills/` 只用于当前项目生成产物。

## Step 0：静默扫描项目并生成 `tech_stack_report`

完成 Step 0 后，**立即**进入 Step 1。

### 强制加载顺序

1. `$CLAUDE_PLUGIN_ROOT/skills/embed/taxonomy-registry.md`
2. `$CLAUDE_PLUGIN_ROOT/skills/detect-tech-stack.md`

### 执行方式

1. 按 `detect-tech-stack.md` 的 Phase 1 → Phase 5 执行
2. 严格使用物理证据，不做自由推断
3. 产出标准 `tech_stack_report`

### 额外扫描（不写入 registry，但供 Step 1 展示）

| 扫描项 | 方法 |
|---|---|
| 项目阶段 | 检查 git log 数量、README.md、Build/ 或 Release/ 目录 |
| 文档存在性 | 检查 `doc/`、`docs/`、`design/`、`策划/`、`文档/` |

### Step 0 完成标准

- `tech_stack_report.engine` 已填写
- `tech_stack_report.directions` 已包含当前主引擎的 13 个方向
- `tech_stack_report.capabilities` 已包含 5 个跨引擎能力
- `tech_stack_report.conflicts` 已检查

禁止在上述内容未完整输出前进入 Step 1。

---

## Step 1：一次性确认矩阵结果

把 Step 0 的结果整理成一张确认表，一次性展示给用户。

### 展示结构

```text
根据项目扫描，Seed 检测到以下矩阵结果，请确认是否正确：

  主引擎：        Unity 2022.3.15f1
  主语言：        C#（主）/ Lua（辅）
  项目阶段：      开发中（共 6 个 commits，有 README）

  引擎主线方向：
    - project_structure                     detected     Assets + asmdef 分层
    - scene_graph_and_lifecycle             detected     SceneManager + MonoBehaviour
    - ui_system                             detected     UGUI + FairyGUI
    - hot_reload                            detected     HybridCLR
    - platform_adaptation                   unknown      命中 Android/iOS 构建脚本，但主平台未确认

  跨引擎能力：
    - lua_embedding                         detected     xLua
    - data_config_pipeline                  detected     Excel + Proto
    - network_protocol_and_sync             unknown      命中 Protobuf，但传输层未确认
    - build_release_and_cicd                detected     GitHub Actions
    - tooling_and_ai_pipeline               detected     MCP + .seed

  无直接对应 / 本轮不生成：
    - 某些矩阵项会因当前引擎无直接项目级方案而标记为 unsupported

  ⚠️ 冲突项：
    - capability.lua_embedding：同时找到 xLua 和 tolua，请告知实际使用哪套

[确认正确，继续]  [检测结果有误，我来描述]
```

### Step 1 展示规则

- `detected` 和 `unknown` 必须逐项展示
- `missing` 可以归入“未检测到 / 未确认”汇总展示
- `unsupported` 必须单独放在“无直接对应 / 本轮不生成”区块
- 每项都要带简短证据说明
- `conflicts` 必须单独列出

### 用户修正规则

- 如果用户选择“确认正确，继续”，则当前已展示且未被反驳的矩阵项全部视为**已确认**
- 如果用户用自然语言修正内容，直接把对应矩阵项写回 `tech_stack_report`
- 用户修正过的矩阵项立即视为**已确认**
- 已在 Step 1 得到答案的冲突项，Step 2 禁止重复询问

### 用户补全状态归一化

Step 1 中任何用户补充 / 修正都必须立即归一化到对应的 `directions[]` 或 `capabilities[]` 项，不能只记录在对话摘要或临时集合里。

- 如果用户补充内容包含路径、目录、文件名、类名、函数名、配置项或关键字符串：
  - 将该项 `status` 改为 `detected`
  - 将用户提供的可验证线索写入 `evidence`
  - 写入 `confirmed_by_user: true`
  - 写入 `user_supplied_evidence: "<用户原始补充或整理后的补充>"`
- 如果用户只补充方案名称、技术选型或自然语言描述，但没有具体落点：
  - 将该项 `status` 改为 `unknown`
  - 将方案名称写入 `variant`
  - 将 `evidence` 写为 `用户确认：<补充内容>`
  - 写入 `confirmed_by_user: true`
  - 写入 `user_supplied_evidence: "<用户原始补充或整理后的补充>"`
- 如果用户明确说明“没有此方向 / 不使用此能力 / 无独立方案”：
  - 保持或改为 `missing`
  - 写入 `confirmed_by_user: true`
  - `evidence` 写为 `用户确认不存在：<补充内容>`
- 用户已补全的矩阵项禁止以原始 `missing` 状态进入 Step 3；除非用户明确确认不存在。

---

## Step 2：补问未确认的矩阵项

### 强制加载顺序

1. `$CLAUDE_PLUGIN_ROOT/skills/embed/taxonomy-registry.md`
2. `$CLAUDE_PLUGIN_ROOT/skills/embed/question-bank.md`

### 执行方式

1. 基于最新的 `tech_stack_report` 建立：
   - `confirmed_directions`
   - `missing_directions`
   - `unresolved_directions`
   - `active_capabilities`
   - `confirmed_capabilities`
   - `unresolved_capabilities`
2. Step 2 只允许追问：
   - 当前主引擎的 `missing_directions` / `unresolved_directions`
   - 已激活 capability 中的 `unresolved_capabilities`
3. 问题文案、候选项和提问顺序以 `question-bank.md` 为准
4. 所有补问完成后，先执行“用户补全状态归一化”
5. 归一化完成后立即进入 Step 3

### Step 2 完成标准

- 当前主引擎的缺口方向都已检查过
- 活跃 capability 的未确认项都已检查过
- 所有用户补充信息都已写回 `tech_stack_report`，且已完成 `status`、`variant`、`evidence`、`confirmed_by_user` 的归一化
- 已确认项未被重复提问

---

## Step 3：基于矩阵生成 skill 文件列表

### 强制加载顺序

1. `$CLAUDE_PLUGIN_ROOT/skills/embed/taxonomy-registry.md`
2. `$CLAUDE_PLUGIN_ROOT/skills/embed/skill-catalog.md`

### 执行方式

1. 根据 `skill-catalog.md` 的规则，从 `tech_stack_report` 动态展开目标文件列表
2. 引擎主线 skill 使用 `domain/<engine>-<direction-kebab>.md`
3. 跨引擎能力 skill 使用 `domain/common-<capability-kebab>.md`
4. `detected`、`unknown`、`confirmed_by_user: true` 且非“用户确认不存在”的项必须进入生成列表
5. `missing` 只有在用户未补全 / 未确认时才默认不生成
6. `unsupported` 默认不生成，除非用户在 Step 1 / Step 2 明确要求改判
7. `unknown` 项允许进入生成列表，但后续 builder 可能写成占位 skill

### Step 3 前置校验

展示生成列表前必须先检查：

- `directions[]` 中是否存在 `confirmed_by_user: true`、用户并未确认不存在、但未进入目标文件列表的项
- `capabilities[]` 中是否存在 `confirmed_by_user: true`、用户并未确认不存在、但未进入目标文件列表的项

如果存在上述项，必须输出“已补全但未生成”的清单并停止 Step 3，先回到状态归一化修正。禁止继续展示残缺生成列表。

### 展示给用户确认

展示时必须同时包含：

- `文件名`
- `matrix_id`
- `作用说明`
- `状态`
  - `新建`
  - `已存在，将覆盖`
  - `已存在，--update 下跳过`

用户可选：

- **确认生成** → 进入 Step 4
- **返回修改** → 回到 Step 2
- **取消** → 中止流程

---

## Step 4：启动 Agent Team 矩阵流水线生成

### 强制加载顺序

1. `$CLAUDE_PLUGIN_ROOT/skills/embed/taxonomy-registry.md`
2. `$CLAUDE_PLUGIN_ROOT/skills/embed/skill-catalog.md`
3. `$CLAUDE_PLUGIN_ROOT/skills/embed/builder-catalog.md`


### 4.0 准备阶段

在创建 Team 前先完成本轮运行状态准备：

1. 生成 `embed_stamp`，格式为 `YYYYMMDD-HHmmss`
2. 计算并创建 `reports_dir = .seed/state/embed/<embed_stamp>/reports/`
3. 读取 `.seed/config.json` 中的 `embed.parallelism`
   - `maxResearchersPerWave` 默认 `4`
   - `maxBuildersPerWave` 默认 `4`
   - `waveTimeoutSeconds` 默认 `600`
   - 字段缺失时使用默认值；任一并发上限显式设为 `0` 时，退化为“一次性全派”
4. 根据 Step 3 的目标文件列表创建 `matrix_jobs`。每个目标 skill 必须对应一个 job，job 是本阶段最小调度单元。
5. 每个 `matrix_job` 必须包含：
   - `matrix_id`
   - `axis`
   - `engine` 或 `capability`
   - `direction_id` 或 `capability_id`
   - `output_file`
   - `fixed_question_file`
   - `researcher_profile`
   - `builder_profile`
   - `researcher_agent`
   - `builder_agent`
   - `report_file`
6. `report_file` 固定为 `<reports_dir>/<matrix_id>.yaml`，例如：
   - `.seed/state/embed/20260410-150122/reports/engine.unity.ui_system.yaml`
   - `.seed/state/embed/20260410-150122/reports/capability.lua_embedding.yaml`
7. profile 与 agent 命名规则：
   - Engine job：
     - `researcher_profile: researcher-<engine>`
     - `builder_profile: builder-engine`
     - `researcher_agent: researcher-<engine>-<direction-kebab>`
     - `builder_agent: builder-<engine>-<direction-kebab>`
   - Capability job：
     - `researcher_profile`: `researcher-lua` / `researcher-config` / `researcher-infra`
     - `builder_profile: builder-common`
     - `researcher_agent: researcher-common-<capability-kebab>`
     - `builder_agent: builder-common-<capability-kebab>`

准备完成后，向用户输出本轮计划摘要：`embed_stamp`、`reports_dir`、`matrix_jobs` 数量、researcher / builder 并发槽上限，以及前 5 个 job 预览。

### 4.1 创建 Team

```text
TeamCreate("seed-embed")
```

#### Agent Team 消息约束

当前 session 只能有一个 Team。调用 `SendMessage` 时：

- `to` 必须是裸 teammate 名称，例如 `leader`、`researcher-unity-ui-system`、`builder-unity-ui-system`
- 禁止把 Team 名写进 `to`，例如不要写 `seed-embed/leader`、`seed-embed.leader`、`seed-embed:leader`
- 禁止在 `to` 里加入角色说明、括号、路径或 `@` 前缀，例如不要写 `researcher-unity-ui-system（UI 方向）`、`@leader`
- 广播只能使用 `to: "*"`
- 如果 `message` 是普通字符串，必须同时提供 `summary`（5-10 个词的短预览）；禁止只传 `to` + 字符串 `message`
- 如果要关闭 teammate，禁止发送普通字符串；必须发送结构化 `message: { "type": "shutdown_request", "reason": "..." }`

创建后立即 SendMessage 给 leader，内容必须包含：

- `embed_stamp`
- `reports_dir`
- `matrix_jobs` 列表或路径
- `maxResearchersPerWave`
- `maxBuildersPerWave`
- `waveTimeoutSeconds`

#### Agent 生命周期约束

- 本轮只允许创建一次 `seed-embed` Team；retry、修复、补派都必须复用当前 Team，禁止再次 `TeamCreate("seed-embed")`
- researcher 写完单个 `matrix_job` 的报告后不要立即关闭，必须等待该 report gate 通过，并等待对应 builder 完成 Precondition 预读确认
- builder 确认单个 report 可读可用后，leader 立即向该 job 的 researcher 发送结构化 `shutdown_request`
- builder 产物通过 leader 验收后，leader 立即向该 builder 发送结构化 `shutdown_request`，不等其他 job 或最终 closeout
- teammate 必须用结构化 `shutdown_response` 批准关闭；不要把批准/拒绝写成普通字符串消息
- 整轮末尾只保留 leader 做汇总；确认无活跃 teammate 或已记录未关闭原因后，再执行最终 `TeamDelete`
- `TeamDelete` 不接收 `team_name`、`message` 或最终摘要文本；最终摘要必须在 `TeamDelete` 成功后作为普通 assistant 输出给用户

### 4.2 Matrix Job Pipeline

Step 4 采用矩阵 job 流水线。leader 必须维护两个队列：

- `researcher_queue`: 尚未调查的 `matrix_jobs`
- `builder_queue`: report gate 已通过、等待生成 skill 的 `matrix_jobs`

并发槽语义：

- `maxResearchersPerWave > 0`：同时最多运行该数量 researcher job
- `maxResearchersPerWave == 0`：一次性派出所有 researcher job
- `maxBuildersPerWave > 0`：同时最多运行该数量 builder job
- `maxBuildersPerWave == 0`：一次性派出所有已就绪 builder job

流水线规则：

1. 按 Step 3 展示顺序启动 researcher job，最多占满 researcher 并发槽。
2. 任一 researcher 写完 `<reports_dir>/<matrix_id>.yaml` 后，leader 立即对该单个 `matrix_id` 运行 report gate。
3. gate 通过的 job 立即进入 `builder_queue`，不等待其它 researcher。
4. builder 并发槽可用时，立即启动该 job 的 builder。
5. builder 写完 `output_file` 后，leader 验收该单个文件并关闭 builder。
6. researcher / builder 失败时只修复或补派同一个 `matrix_id`，禁止全量重派。
7. 所有 `matrix_jobs` 都达到 `built | skipped | failed` 终态后，才进入 closeout。

### 4.3 Researcher Job

每个 researcher TaskCreate 只调查一个 `matrix_job`，必须包含：

- `Task Kind: investigate`
- `Expected Owner Role: researcher`
- `Agent Name: <researcher_agent>`
- `Profile: <researcher_profile>`
- `Deliverable: 写 yaml 到 <report_file>；写完后 SendMessage 给 leader，只发送 report_path + status + summary（≤10 行）`
- `Dependencies: none`
- `Precondition: none`
- 本次 `embed_stamp`
- 本次 `reports_dir`
- 完整 `matrix_job`

硬约束：

- researcher 必须只调查 `matrix_job.matrix_id`。
- researcher 必须只加载该 `matrix_id` 的 `fixed_question_file` 与匹配 composite 文件。
- researcher 报告顶层 `matrix_id`、`output_file`、`fixed_question_file` 必须与 `matrix_job` 完全一致。
- researcher 不得输出其它 `matrix_id` 的结论、固定问题或旁注；需要交给其它方向的信息只写在 `handoff_notes`，不得进入 `domain_findings` 或 `fixed_question_results`。
- researcher 必须使用原子写模式落盘报告（先写 `<matrix_id>.yaml.tmp`，再 rename 为 `<matrix_id>.yaml`）。
- mailbox 内禁止发送完整报告正文。

### 4.4 Per-Report Gate

每个 researcher job 完成后，leader 必须立即运行插件内置 Node gate：

```text
node $CLAUDE_PLUGIN_ROOT/scripts/validate-embed-reports.mjs <reports_dir> <matrix_id>
```

该 gate 至少校验：

- `<reports_dir>/<matrix_id>.yaml` 存在且不是 `.tmp`
- 文件非空、不是 fenced markdown、无 tab、无冲突标记
- 包含 `researcher-common.md` 要求的四段报告结构与固定问题回答段
- 顶层 `matrix_id` 与文件名、命令参数一致
- `fixed_question_results[].matrix_id` 只能等于当前 `matrix_id`
- report 中不得混入其它 `engine.*.*` 或 `capability.*` 矩阵项

失败处理：

1. 先解析 gate 输出并绑定到当前 `matrix_id`。
2. 优先通过 `SendMessage` 通知原 researcher 修复同名 report：
   - 消息包含 gate 原始失败摘要、`matrix_job`、目标 `report_file`、本次 `embed_stamp`、本次 `reports_dir`
   - 要求 researcher 只修复当前 `matrix_id`，不得重做无关 job，不得写新 reports_dir
3. retry 期间禁止再次 `TeamCreate("seed-embed")`，禁止全量重派。
4. 只有原 researcher 不可用、拒绝修复或修复等待超过 `waveTimeoutSeconds` 时，才允许为该 `matrix_id` 单独补派 1 个 replacement researcher。
5. replacement researcher 仍写回同一 `report_file`；每个 `matrix_id` 最多补派 1 次。
6. 如果修复或补派后仍失败，将失败 `matrix_id`、缺失路径、等待时间、已存在报告列表写入 `.seed/logs/embed-<embed_stamp>.log`，该 job 标记为 `failed`。

### 4.5 Builder Job

每个 builder TaskCreate 只写一个 `matrix_job.output_file`，必须包含：

- `Task Kind: implement`
- `Expected Owner Role: builder`
- `Agent Name: <builder_agent>`
- `Profile: <builder_profile>`
- `Deliverable: 只写 <output_file>`
- `Dependencies: none`
- `Precondition: 读取 <report_file>`
- 完整 `matrix_job`

builder 启动后必须先读取自己的单个 `report_file`，并立即 SendMessage 给 leader 发送预读确认：

- `confirmed_reports`: `[<report_file>]`
- `missing_or_invalid_reports`: 缺失或不可解析时写 `[<report_file>]`
- `covered_researchers`: `[<researcher_agent>]`
- `matrix_id`: 当前 job 的 `matrix_id`

leader 收到预读确认且 `missing_or_invalid_reports` 为空后，立即关闭该 job 的 researcher。随后 builder 再生成 `output_file`。

builder 硬约束：

- 只能写 `matrix_job.output_file`。
- 只能读取 `matrix_job.report_file` 作为事实源。
- 生成 frontmatter 时必须使用 `matrix_job` 的 `matrix_id`、`axis`、`engine/capability`、`direction_id/capability_id`、`question_set_id`、`fixed_question_file`。
- 生成 `## 固定问题` 前，必须重新加载 `matrix_job.fixed_question_file`；`Q` 来自 fixed question 文件，`A` 来自同一 report 的 `fixed_question_results`。
- 若 report 缺失对应 question_id，或 question_id / question 与 fixed question 文件不匹配，不得自行补答；该题写 `未回答` 并将 skill 标为 `source: incomplete` 或升级给 leader。

### 4.6 Researcher 加载顺序

所有 researcher 创建前都必须遵守：

1. 先加载 `$CLAUDE_PLUGIN_ROOT/skills/embed/researcher-common.md`
2. 需要回答“运行时固定问题”的 researcher 再加载 `$CLAUDE_PLUGIN_ROOT/skills/embed/researcher-runtime-common.md`
3. 再加载 `$CLAUDE_PLUGIN_ROOT/skills/embed/taxonomy-registry.md`
4. 最后加载各自领域文件

按 `taxonomy-registry.md` 的双轴矩阵分类：

- 引擎主线 researcher profile：
  - `researcher-unity`
  - `researcher-godot`
  - `researcher-unreal`
  - `researcher-cocos`
- 跨引擎能力 researcher profile：
  - `researcher-lua`
  - `researcher-config`
  - `researcher-infra`

其中会加载 `researcher-runtime-common.md` 的只有两类：

- 引擎主线 runtime researcher：
  - `researcher-unity`
  - `researcher-godot`
  - `researcher-unreal`
  - `researcher-cocos`
- 跨引擎运行时能力 researcher：
  - `researcher-lua`

说明：

- `researcher-lua` 属于 capability owner，不与引擎并列。
- 它之所以也加载 `researcher-runtime-common.md`，只是因为 Lua 嵌入能力经常直接承载运行时实现路径，遇到 fixed question 中的强制项时必须按同一缺失协议处理。
- `researcher-config` 和 `researcher-infra` 不加载该文件，因为它们负责的是非运行时主线能力，不承担引擎运行时主线固定问题。

#### Researcher 固定问题文件

- researcher 在正式搜索前，必须按当前 job 的唯一 `matrix_id` 加载对应 `fixed_question_file`
- 如果存在匹配的 composite fixed question 文件，再追加加载
- fixed question 文件缺失时，必须在调查报告中明确写缺失路径，不得自行补题

### 4.7 Builder 约束

- builder 必须先读取自己的 Precondition 指定的单个 yaml 报告。若报告缺失或无法解析，立即 SendMessage 升级给 leader，不得跳过
- builder 必须等待 leader 确认其预读结果；若 leader 要求回到 per-report gate 修复报告，builder 暂停生成
- builder 只能基于对应落盘 researcher 报告写 skill
- 所有 frontmatter 必须带：
  - `matrix_id`
  - `axis`
  - `engine` 或 `capability`
  - `direction_id` 或 `capability_id`
  - `question_set_id`
  - `fixed_question_file`
  - `source`
- 所有 skill 都必须带：
  - `## 结论`
  - `## 证据`
  - `## 使用约定`
  - `## 固定问题`
- `## 固定问题` 不再写统一挂点：
  - 先按 `matrix_id` 加载对应 fixed question 文件
  - 如有匹配的 composite fixed question 文件，再追加加载
  - 文件缺失时只写缺失路径，不得补写猜测问题
  - 文件存在时必须逐题写 `Q` 与 `A`；`Q` 来自 fixed question 文件，`A` 来自 researcher 报告的 `fixed_question_results`
  - 若 researcher 报告缺少某题回答，不得自行推断补答；该题写 `未回答` 并将 skill 标为 `source: incomplete` 或升级给 leader
- researcher 报告里如有 `必查项缺失错误` 或明确证据不足，builder 只能生成占位 skill，并写 `source: incomplete`

### 4.8 Leader Closeout

leader 的 closeout 规则以 `builder-catalog.md` 为准，摘要必须单独列出：

- 正常生成的 skill
- 占位 skill
- 因 `missing` / `unsupported` 未生成的矩阵项
- 必查项缺失 / 需要用户补充的关键实现
- 本次执行队列：
  - researcher job 总数、成功数、失败数、补派数
  - builder job 总数、成功数、失败数、补派数
  - 实际峰值 researcher / builder 并发
- 本次 agent 生命周期统计：
  - 每个 agent 的创建、修复/补派、builder 预读确认、leader 验收、关闭状态
  - 如存在未关闭 agent，必须逐个列出原因
  - 如 `Agent ×N` 明显高于计划值，必须说明是定向补派导致，还是异常重复创建导致

---

## Step 5：完成摘要

Team 完成后，输出最终摘要：

```text
✅ /seed:embed 完成

已生成：
  ✅ domain/unity-project-structure.md
  ✅ domain/unity-ui-system.md
  ✅ domain/common-lua-embedding.md
  ✅ domain/common-build-release-and-cicd.md

占位 skill：
  ⚠️ domain/unreal-hot-reload.md（证据不足，source: incomplete）

未生成：
  - engine.godot.hot_reload（unsupported）
  - capability.network_protocol_and_sync（missing）

需后续补充：
  - Lua 热修入口仍未定位
  - 网络传输层只找到 `.proto`，未找到发送/接收实现

生成的 domain skill 已写入 `.seed/skills/domain/`。
后续可随时运行 `/seed:embed --update` 增量补齐。
```
