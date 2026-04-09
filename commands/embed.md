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
4. 所有补问完成后立即进入 Step 3

### Step 2 完成标准

- 当前主引擎的缺口方向都已检查过
- 活跃 capability 的未确认项都已检查过
- 所有用户补充信息都已写回 `tech_stack_report`
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
4. `missing` 和 `unsupported` 默认不生成
5. `unknown` 项允许进入生成列表，但后续 builder 可能写成占位 skill

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

### Team 不可用时的降级方式

如果当前环境无法使用 `TeamCreate` / `TaskCreate` / `SendMessage`：

1. 按 Step 3 的文件列表串行生成 `.seed/skills/domain/` 文件
2. 严格遵守 `builder-catalog.md`
3. 在最终摘要中明确说明“本次使用单 agent 降级模式完成”

### 4.1 创建 Team

```text
TeamCreate("seed-embed")
```

### 4.2 决定派出哪些 researcher / builder

只派出与目标文件列表相关的 agent。

#### 引擎 builder / researcher

- 如果目标列表含 `domain/unity-*.md` → 派 `builder-unity` + `researcher-unity`
- 如果目标列表含 `domain/godot-*.md` → 派 `builder-godot` + `researcher-godot`
- 如果目标列表含 `domain/unreal-*.md` → 派 `builder-unreal` + `researcher-unreal`
- 如果目标列表含 `domain/cocos-*.md` → 派 `builder-cocos` + `researcher-cocos`

#### Capability builder / researcher

- 如果目标列表含 `domain/common-lua-embedding.md` → 派 `builder-lua` + `researcher-lua`
- 如果目标列表含 `domain/common-data-config-pipeline.md` → 派 `builder-config` + `researcher-config`
- 如果目标列表含 `domain/common-network-protocol-and-sync.md`
  或 `domain/common-build-release-and-cicd.md`
  或 `domain/common-tooling-and-ai-pipeline.md`
  → 派 `builder-infra` + `researcher-infra`

### 4.3 创建顺序

固定顺序：

1. 先创建所有按需 builder task
2. 再创建所有按需 researcher task

原因：

- skill 文件责任必须先绑定到 builder
- researcher 只负责调查，不负责落笔
- builder 可以先建立依赖，等待 researcher 完成后再写

### 4.4 Researcher 加载顺序

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

### 4.5 Builder 约束

- builder 只能基于对应 researcher 的报告写 skill
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
- researcher 报告里如有 `必查项缺失错误` 或明确证据不足，builder 只能生成占位 skill，并写 `source: incomplete`

### 4.6 Leader Closeout

leader 的 closeout 规则以 `builder-catalog.md` 为准，摘要必须单独列出：

- 正常生成的 skill
- 占位 skill
- 因 `missing` / `unsupported` 未生成的矩阵项
- 必查项缺失 / 需要用户补充的关键实现

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
