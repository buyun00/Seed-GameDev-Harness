---
name: embed
description: 分析项目技术栈，生成项目专属 domain skill
argument-hint: "[--update]"
---

# /seed:embed

你正在执行 Seed 的项目技术栈分析与 domain skill 生成流程。

**语言**：读取 `.seed/config.json` → `language`。如果已设置，所有面向用户的输出使用配置的语言。以下模板是中文示例，请根据配置语言适配。

## Flag 解析

从 `{{ARGUMENTS}}` 中检查是否包含 `--update`：

| Flag | 行为 |
|---|---|
| 无 flag | **全量模式**：重新生成所有 domain skill，已有文件覆盖 |
| `--update` | **增量模式**：只生成缺失的 skill，已有文件保留不覆盖 |

## 启动提示

运行后立即输出：

```text
开始分析项目技术栈...

⏳ 这个过程需要一段时间，Seed 会扫描项目结构、
   读取关键文件，并生成专属的 domain skill。
请耐心等待，不要中断。
```

---

## 执行保障（必须遵守）

- **Step 0 只是静默扫描，不是流程终点。** 扫描完成后，必须在同一轮内立刻进入 Step 1，向用户展示确认内容。禁止只进行搜索/读取后直接结束当前回复。
- 如果当前环境**不支持** `AskUserQuestion`，或按钮/表单式交互没有成功弹出，必须立即降级为普通文本提问，并明确告诉用户该如何回复，例如：`回复 1 继续，回复 2 修改`。不要因为缺少 `AskUserQuestion` 而停住。
- 每到一个需要用户输入的节点，都要明确写出“你现在需要回复什么”。不要把下一步留在隐含状态。
- 如果 `tech_stack_report` 中存在 `conflicts`，必须在 Step 1 中明确展示冲突项，并让用户选择正确答案；不要自行裁决冲突。
- 如果当前环境无法使用 `TeamCreate` / `TaskCreate` / `SendMessage`，必须明确告知用户，并降级为单 agent 串行生成 `.seed/skills/domain/` 文件；不要静默结束。
- `/seed:embed` 的外置 skill 不是参考资料，而是执行规范。加载后必须按其规则执行，不能只摘几句自由发挥。

## Step 0：扫描项目技术栈（静默，不展示给用户）

完成 Step 0 后，**立即**进入 Step 1；不要等待额外指令。

**本步骤强制调用 `seed/skills/detect-tech-stack.md` 执行，不允许自行判断，不允许跳过任何 Phase。**

### 执行方式

1. 加载 `seed/skills/detect-tech-stack.md`
2. 按 Phase 1 → Phase 2 → Phase 3（各子项）→ Phase 4 顺序执行
3. 每个检测项严格按该 skill 中定义的「物理证据规则」查找，不做自由推断
4. Phase 4 输出标准 `tech_stack_report` 结构体，作为 Step 1 的数据来源

### 额外扫描（不在 detect-tech-stack 中，Step 0 自行完成）

| 扫描项 | 方法 |
|---|---|
| **项目阶段** | 检查 git log 数量（0-10 commits = 原型；>10 = 开发中）；检查 README.md 是否存在；检查 Build/ 或 Release/ 目录是否存在 |
| **策划文档** | 检查 doc/ design/ 策划/ 文档/ 目录是否存在 |

### Step 0 完成标准

- `tech_stack_report` 已完整输出（所有字段填写，无遗漏）
- `conflicts` 字段已检查（如有冲突，Step 1 中必须展示给用户确认）
- 以上两项额外扫描已完成

禁止在 `tech_stack_report` 未完整输出前进入 Step 1。

---

## Step 1：大方向确认（扫描后一次性确认）

把 Step 0 的推断结果整理成一张确认表，一次性展示：

```text
根据项目扫描，Seed 检测到以下技术栈，请确认是否正确：

  引擎：          Unity 2022.3.15f1
  语言：          C#（主）/ Lua（辅）
  项目阶段：      开发中（共 6 个 commits，有 README）

  Lua 桥接：      tolua（证据：Assets/ToLua/ 目录存在）
  UI 框架：       FairyGUI / UGUI
  热更方案：      tolua 热更新
  资源管理：      Addressables
  配置表：        Excel 导出
  网络层：        自研网络框架
  其他集成：      MCP 集成 / CI/CD（GitHub Actions）

  ⚠️ 冲突项（需要你确认）：
    lua_bridge：同时找到 Assets/XLua/ 和 Assets/ToLua/，请告知实际使用哪个

  未检测到：UI Toolkit / HybridCLR / ILRuntime / Netcode / Mirror

[确认正确，继续]  [检测结果有误，我来描述]
```

如有修改，直接让用户用自然语言描述需要修正的内容：

```text
检测结果有误？请直接描述需要修正的地方，例如：
"热更方案不对，实际是 HybridCLR"
"UI 框架还有 FairyGUI，不只是 UGUI"
"引擎版本是 2021.3，不是 2022.3"

描述完成后直接回复即可，Seed 会更新检测结果并继续。
```

收到用户描述后，直接更新 `tech_stack_report` 中对应字段，然后进入 Step 2 检查是否还有遗漏项。
不要把用户刚刚已经口头修正过的内容再做一次问卷确认。

用户选择「确认正确，继续」后也进入 Step 2。

### Step 1 确认结果的生效规则

- 用户选择「确认正确，继续」后，Step 1 中已展示且用户未提出异议的分组，全部视为**已确认**。
- 用户用自然语言描述修正内容后，先把对应字段直接写回 `tech_stack_report`；这些已修正字段立即视为**已确认**。
- `conflicts` 中的冲突项如果已在 Step 1 得到用户答案，视为**已解决**，Step 2 禁止再次询问同一冲突。
- Step 2 的职责是检查**遗漏项 / 未检测到项 / 仍不确定项**，不是把 Step 1 已确认或刚修正完的内容重新问一遍。
- 如果用户在 Step 1 中补充了新事实（例如“还有 FairyGUI”），先合并进 `tech_stack_report`，再基于更新后的结果决定 Step 2 还要不要补问其他遗漏项。

### Step 1 展示规则

- 所有 `tech_stack_report` 中值不为 `none / false / []` 的字段全部展示
- 每项附带检测证据（括号内简短说明）
- `conflicts` 字段非空时，必须在确认表中单独列出「⚠️ 冲突项」区块
- 值为 `none / false / []` 的字段归入「未检测到」一行统一列出，不单独占行
- 引擎版本从 `tech_stack_report.engine.version` 读取，读不到显示「版本未知」

---

## Step 2：遗漏项补充（只问缺口，不重复确认）

**本步骤强制加载 `seed/skills/embed/question-bank.md` 执行。**

### 执行方式

1. 基于最新的 `tech_stack_report` 建立 `confirmed_groups`、`missing_groups`、`unresolved_groups`
2. 只有 `missing_groups` 和 `unresolved_groups` 可以进入 Step 2
3. 提问文案、触发条件、选项内容全部以 `seed/skills/embed/question-bank.md` 为准
4. 所有遗漏项问完后立即进入 Step 3，不再对已确认分组追问

### Step 2 完成标准

- 所有与当前技术栈相关的缺口都已按题库检查过
- 已确认项未被重复提问
- 用户补充的新信息已写回 `tech_stack_report`

---

## Step 3：生成 skill 文件列表

**本步骤强制加载 `seed/skills/embed/skill-catalog.md` 执行。**

### 执行方式

1. 加载 `seed/skills/embed/skill-catalog.md`
2. 根据 Step 1 已确认的答案与 Step 2 的补充结果，生成目标 skill 文件列表
3. 文件映射、说明、扩展规则都以 `skill-catalog.md` 为准
4. 如果扫描发现了 catalog 未列出的项目特有技术方案，主动新增对应 skill
5. 如果某个 skill 在当前项目中找不到足够证据，先保留在列表中，并在后续生成阶段按占位 skill 处理

### 展示给用户确认

整理完整文件列表，必须同时包含：

- `文件名`
- `作用说明`
- `状态`（新建 / 已存在，将覆盖 / 已存在，--update 下跳过）

确认文案、展示格式和文本降级方式，都以 `seed/skills/embed/skill-catalog.md` 为准。

- **确认生成** → 进入 Step 4
- **返回修改** → 回到 Step 2
- **取消** → 中止流程

---

## Step 4：启动 Agent Team 并行生成

用户确认后，使用 Seed 的 CC 原生 agent team 机制并行生成 skill 文件。

如果当前环境无法使用 `TeamCreate` / `TaskCreate` / `SendMessage`，不要中止。改为当前会话串行执行以下工作：

1. 按 Step 3 确认的文件列表逐个生成 `.seed/skills/domain/` 文件
2. 严格遵守 `seed/skills/embed/builder-catalog.md` 中的生成规则
3. 在最终摘要中明确说明：本次因 Team 能力不可用，已使用单 agent 降级模式完成

### 4.1 创建 Team

```text
TeamCreate("seed-embed")
```

### 4.2 根据生成列表决定派出哪些 researcher / builder

只派出与生成列表相关的 agent。例如，如果没有 Lua 相关 skill 要生成，就不派 `researcher-lua` 和 `builder-lua`。

创建顺序固定为：

1. 先创建所有按需 builder task
2. 再创建所有按需 researcher task

原因：

- 写 skill 文件的责任必须先绑定到 builder；researcher 只负责调查，不负责落笔
- researcher 的调查报告必须有明确接收方，避免执行端临时补出别的写作者
- builder 可以先创建，并保持 `Dependencies: researcher-*`，这样会在 researcher 完成后再开始写文件

### 4.3 派出 Researcher 并行扫描

所有 researcher 使用 `disallowedTools: Write, Edit, MultiEdit`，只读不写，产出调查报告发送给 `leader` 和对应 `builder-*`。

所有 researcher 任务无依赖，全部并行。

#### Researcher 加载顺序

所有 researcher 创建前都必须遵守以下加载顺序：

1. 先加载 `seed/skills/embed/researcher-common.md`
2. 如果是运行时 researcher，再加载 `seed/skills/embed/researcher-runtime-common.md`
3. 最后加载各自领域文件

运行时 researcher：

- `researcher-unity`
- `researcher-lua`
- `researcher-infra`
- `researcher-godot`
- `researcher-unreal`
- `researcher-cocos`

非运行时 researcher：

- `researcher-config`

#### 各 researcher 对应的领域文件

- `researcher-unity` → `seed/skills/embed/researcher-unity.md`
- `researcher-lua` → `seed/skills/embed/researcher-lua.md`
- `researcher-config` → `seed/skills/embed/researcher-config.md`
- `researcher-infra` → `seed/skills/embed/researcher-infra.md`
- `researcher-godot` → `seed/skills/embed/researcher-godot.md`
- `researcher-unreal` → `seed/skills/embed/researcher-unreal.md`
- `researcher-cocos` → `seed/skills/embed/researcher-cocos.md`

#### Researcher 创建要求

- 每个 researcher 的 `TaskCreate` 描述，必须直接使用对应领域文件中的模板
- 调查报告必须统一输出三段：
  - 通用规则执行结果
  - 运行时必查项结果（非运行时 researcher 写 `N/A`）
  - 领域发现
- 运行时必查项一旦在扩大搜索后仍未找到，必须输出 `必查项缺失错误`
- 禁止 researcher 用框架通用知识补写项目实现

### 4.4 派出 Builder 落笔写文件

**本步骤强制加载 `seed/skills/embed/builder-catalog.md` 执行。**

各 builder 依赖对应 researcher 完成，builder 之间并行。

执行要求：

1. builder 的 `TaskCreate` 描述直接使用 `builder-catalog.md` 中的模板
2. builder 只能基于 researcher 报告生成内容
3. 若 researcher 报告存在 `必查项缺失错误`，builder 只能生成占位 skill，并在首段写明缺失项与已搜索范围
4. `source` 字段规则以 `builder-catalog.md` 为准：
   - 有充分依据 → `scanned`
   - 缺证据 / 必查项缺失 / 仅有部分实现 → `incomplete`

### 4.5 Leader Closeout

`leader` 的 closeout 任务模板和完成标准也以 `seed/skills/embed/builder-catalog.md` 为准。

完成摘要中必须单独列出：

- 正常生成的 skill
- 占位 skill
- 必查项缺失 / 需用户补充的关键运行时实现

### 4.6 向 Leader 发送启动消息

```text
SendMessage → leader：
  目标：分析项目技术栈，生成 domain skill 文件

  创建顺序要求：
    先创建所有按需 builder task（带 Dependencies）
    再创建所有按需 researcher task

  researcher 统一加载顺序：
    researcher-common
    runtime researcher 再加 researcher-runtime-common
    最后加载各自 researcher-<domain>

  researcher 分工（按需派出）：
    researcher-unity  → Unity/C# 方向
    researcher-lua    → Lua 方向
    researcher-config → 配置/策划方向
    researcher-infra  → 基础设施方向
    researcher-godot  → Godot 方向
    researcher-unreal → Unreal 方向
    researcher-cocos  → Cocos 方向

  builder 分工（按需派出，依赖对应 researcher）：
    builder-unity
    builder-lua
    builder-config
    builder-infra
    builder-godot
    builder-unreal
    builder-cocos

  builder 约束：
    只基于 researcher 报告写 skill
    遇到必查项缺失错误时只生成占位 skill

  closeout 约束：
    单独列出“必查项缺失 / 需用户补充”区块
```

---

## Step 5：完成摘要

Team 完成后，输出最终摘要：

```text
✅ /seed:embed 完成

生成了 N 个 domain skill：
  ✅ domain/project-structure.md
  ✅ domain/csharp-coding-rules.md
  ✅ domain/lua-architecture.md
  ⚠️ domain/ugui-event-system.md（占位 skill，未找到按钮绑定实现）
  ⚠️ domain/config-schema.md（内容待补充，未找到配置表相关代码）
  ...

必查项缺失 / 需用户补充：
  - 按钮点击绑定：已搜索 Assets/Scripts/UI、Assets/Scripts/Runtime、全仓库关键字 Click / OnClick / Bind，仍未定位实际实现
  - 资源释放：已搜索 Loader / Release / Unload 相关实现，仍无法确认统一释放入口

标注 ⚠️ 的文件内容不完整，建议根据项目实际情况手动补充。
后续可随时运行 /seed:embed --update 补充新增模块的 skill。
```

## 生成规范

生成的 domain skill 继续写入 `.seed/skills/domain/`，并使用统一 frontmatter：

- `name`
- `description`
- `triggers`
- `domain`
- `scope`
- `source`

`source` 取值规则：

- `scanned`：内容基于项目实际代码扫描得出，有充分依据
- `incomplete`：项目中未找到足够证据，当前文件为占位或待补充状态
