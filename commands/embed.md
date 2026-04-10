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

## Step 4：启动 Agent Team 并行生成

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
   - 字段缺失时使用默认值；任一 wave 上限显式设为 `0` 时，退化为“一次性全派”
4. 根据 Step 3 的目标文件列表确定激活 researcher，保持以下稳定顺序并去重：
   - 如果目标列表含 `domain/unity-*.md` → 激活 `researcher-unity`
   - 如果目标列表含 `domain/godot-*.md` → 激活 `researcher-godot`
   - 如果目标列表含 `domain/unreal-*.md` → 激活 `researcher-unreal`
   - 如果目标列表含 `domain/cocos-*.md` → 激活 `researcher-cocos`
   - 如果目标列表含 `domain/common-lua-embedding.md` → 激活 `researcher-lua`
   - 如果目标列表含 `domain/common-data-config-pipeline.md` → 激活 `researcher-config`
   - 如果目标列表含 `domain/common-network-protocol-and-sync.md`
     或 `domain/common-build-release-and-cicd.md`
     或 `domain/common-tooling-and-ai-pipeline.md`
     → 激活 `researcher-infra`
5. 根据 Step 3 的目标文件列表确定激活 builder，保持以下稳定顺序并去重：
   - 如果目标列表含任何 `domain/<engine>-*.md`（engine 为 unity/godot/unreal/cocos）→ 激活 `builder-engine`
   - 如果目标列表含任何 `domain/common-*.md` → 激活 `builder-common`

准备完成后，向用户输出本轮计划摘要：`embed_stamp`、`reports_dir`、激活 researcher、激活 builder、wave 并发上限。

### 4.1 创建 Team

```text
TeamCreate("seed-embed")
```

#### Agent Team 消息约束

当前 session 只能有一个 Team。调用 `SendMessage` 时：

- `to` 必须是裸 teammate 名称，例如 `leader`、`researcher-unity`、`builder-engine`
- 禁止把 Team 名写进 `to`，例如不要写 `seed-embed/leader`、`seed-embed.leader`、`seed-embed:leader`
- 禁止在 `to` 里加入角色说明、括号、路径或 `@` 前缀，例如不要写 `researcher-unity（引擎主线）`、`@leader`
- 广播只能使用 `to: "*"`

创建后立即 SendMessage 给 leader，内容必须包含：

- `embed_stamp`
- `reports_dir`
- 激活 researcher 列表
- 激活 builder 列表
- `maxResearchersPerWave`
- `maxBuildersPerWave`
- `waveTimeoutSeconds`

### 4.2 Phase A：Researcher Wave

先派 researcher，不派 builder。按 `maxResearchersPerWave` 将激活 researcher 分批：

- `maxResearchersPerWave > 0`：每批最多该数量
- `maxResearchersPerWave == 0`：全部 researcher 放入同一批

每个 researcher TaskCreate 都必须包含：

- `Task Kind: investigate`
- `Expected Owner Role: researcher`
- `Deliverable: 写 yaml 到 <reports_dir>/researcher-<domain>.yaml；写完后 SendMessage 给 leader，只发送 report_path + status + summary（≤10 行）`
- `Dependencies: none`
- `Precondition: none`
- 本次 `embed_stamp`
- 本次 `reports_dir`

每个 researcher 必须使用原子写模式落盘报告（先写 `.tmp`，再 rename 为 `.yaml`），并禁止在 mailbox 内发送完整报告正文。

每个 wave 启动后，主流程进入 gate 等待：

1. 轮询 `reports_dir`
2. 等本批所有 `researcher-<domain>.yaml` 均出现
3. 检查单个 wave 等待时间不得超过 `waveTimeoutSeconds`
4. 本批全部就绪后，才允许启动下一批 researcher

### 4.3 Phase A Gate

所有 researcher wave 完成后，做最终 gate：

1. 校验所有激活 researcher 对应的 yaml 报告均存在
2. 必须先运行插件内置的 Node gate（无外部依赖）：

```text
node $CLAUDE_PLUGIN_ROOT/scripts/validate-embed-reports.mjs <reports_dir> <domain> [domain...]
```

该 gate 至少校验文件存在、非空、无 `.tmp` 残留、不是 fenced markdown、无冲突标记，并包含 `researcher-common.md` 要求的四段报告结构与固定问题回答段。

3. 如果环境另外提供 YAML parser，可以在 Node gate 通过后追加完整解析检查
4. 禁止在没有任何 gate 校验通过的情况下继续；没有额外 YAML parser 时，以内置 Node gate 为最低通过条件
5. 任一报告缺失、无法解析或结构不完整时，重派对应 researcher 1 次
6. 重派后继续等待同一 `reports_dir` 下的同名 yaml，仍以 `waveTimeoutSeconds` 作为超时
7. 如果重派仍失败：
   - 将失败 researcher、缺失路径、等待时间、已存在报告列表写入 `.seed/logs/embed-<embed_stamp>.log`
   - 终止 Step 4
   - 向用户说明失败原因，不进入 Phase B

### 4.4 Phase B：Builder Wave

Phase A Gate 全部通过后，才派 builder。按 `maxBuildersPerWave` 将激活 builder 分批：

- `maxBuildersPerWave > 0`：每批最多该数量
- `maxBuildersPerWave == 0`：全部 builder 放入同一批

每个 builder TaskCreate 都必须包含：

- `Task Kind: implement`
- `Expected Owner Role: builder`
- `Dependencies: none`
- 对应的 `Precondition`

`builder-engine` 的 Precondition：

```text
Precondition: 读取 <reports_dir>/researcher-{unity,godot,unreal,cocos}.yaml 中本轮实际激活且存在的报告
```

`builder-common` 的 Precondition：

```text
Precondition: 读取 <reports_dir>/researcher-{lua,config,infra}.yaml 中本轮实际激活且存在的报告
```

builder 启动后必须先读取自己的 Precondition 指定报告，再按报告内容为每个目标 `matrix_id` 独立生成 skill。Phase B 中 builder 不依赖 mailbox 内联报告。

### 4.5 Researcher 加载顺序

所有 researcher 创建前都必须遵守：

1. 先加载 `$CLAUDE_PLUGIN_ROOT/skills/embed/researcher-common.md`
2. 需要回答“运行时固定问题”的 researcher 再加载 `$CLAUDE_PLUGIN_ROOT/skills/embed/researcher-runtime-common.md`
3. 再加载 `$CLAUDE_PLUGIN_ROOT/skills/embed/taxonomy-registry.md`
4. 最后加载各自领域文件

按 `taxonomy-registry.md` 的双轴矩阵分类：

- 引擎主线 researcher：
  - `researcher-unity`
  - `researcher-godot`
  - `researcher-unreal`
  - `researcher-cocos`
- 跨引擎能力 researcher：
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
- 它之所以也加载 `researcher-runtime-common.md`，只是因为 Lua 嵌入能力经常直接承载按钮绑定、UI 开关、模块通信、场景流转、资源生命周期等运行时实现，必须回答同一组固定问题。
- `researcher-config` 和 `researcher-infra` 不加载该文件，因为它们负责的是非运行时主线能力，不承担这 5 个固定问题。

#### Researcher 固定问题文件

- researcher 在正式搜索前，必须按自己负责的每个 `matrix_id` 加载对应 `fixed_question_file`
- 如果存在匹配的 composite fixed question 文件，再追加加载
- fixed question 文件缺失时，必须在调查报告中明确写缺失路径，不得自行补题

### 4.6 Builder 约束

- builder 必须先读取自己的 Precondition 指定的 yaml 报告。若报告缺失或无法解析，立即 SendMessage 升级给 leader，不得跳过
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

### 4.7 Leader Closeout

leader 的 closeout 规则以 `builder-catalog.md` 为准，摘要必须单独列出：

- 正常生成的 skill
- 占位 skill
- 因 `missing` / `unsupported` 未生成的矩阵项
- 必查项缺失 / 需要用户补充的关键实现
- 本次执行 waves：
  - Phase A 每个 wave 派出的 researcher 数量与名称
  - Phase B 每个 wave 派出的 builder 数量与名称
  - 默认配置下峰值并发 ≤ 5；如果用户调高并发配置，则按实际峰值报告

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
