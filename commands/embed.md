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

```
开始分析项目技术栈...

⏳ 这个过程需要一段时间，Seed 会扫描项目结构、
   读取关键文件，并生成专属的 domain skill。
请耐心等待，不要中断。
```

---

## 执行保障（必须遵守）

- **Step 0 只是静默扫描，不是流程终点。** 扫描完成后，必须在同一轮内立刻进入 Step 1，向用户展示确认内容。**禁止**只进行搜索/读取后直接结束当前回复。
- 如果当前环境**不支持** `AskUserQuestion`，或按钮/表单式交互没有成功弹出，**必须立即降级为普通文本提问**，并明确告诉用户该如何回复，例如：`回复 1 继续，回复 2 修改`。**不要**因为缺少 `AskUserQuestion` 而停住。
- 每到一个需要用户输入的节点，都要明确写出“你现在需要回复什么”。**不要**把下一步留在隐含状态。
- 如果 `tech_stack_report` 中存在 `conflicts`，必须在 Step 1 中明确展示冲突项，并让用户选择正确答案；不要自行裁决冲突。
- 如果当前环境无法使用 `TeamCreate` / `TaskCreate` / `SendMessage`，必须明确告知用户，并**降级为单 agent 串行生成** `.seed/skills/domain/` 文件；**不要**静默结束。

## Step 0：扫描项目技术栈（静默，不展示给用户）

完成 Step 0 后，**立即**进入 Step 1；不要等待额外指令。

**本步骤强制调用 detect-tech-stack skill 执行，不允许自行判断，不允许跳过任何 Phase。**

### 执行方式

1. 加载 `.seed/skills/detect-tech-stack.md`
2. 按 Phase 1 → Phase 2 → Phase 3（各子项）→ Phase 4 顺序执行
3. 每个检测项严格按 skill 中定义的「物理证据规则」查找，不做自由推断
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

**禁止**在 `tech_stack_report` 未完整输出前进入 Step 1。

---

## Step 1：大方向确认（扫描后一次性确认）

把 Step 0 的推断结果整理成一张确认表， 一次性展示：

```
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
- `conflicts` 中的冲突项如果已在 Step 1 得到用户答案，视为**已解决**，Step 2 **禁止**再次询问同一冲突。
- Step 2 的职责是检查**遗漏项 / 未检测到项 / 仍不确定项**，**不是**把 Step 1 已确认或刚修正完的内容重新问一遍。
- 如果用户在 Step 1 中补充了新事实（例如“还有 FairyGUI”），先合并进 `tech_stack_report`，再基于更新后的结果决定 Step 2 还要不要补问其他遗漏项。

### Step 1 展示规则

- 所有 tech_stack_report 中值不为 none / false / [] 的字段全部展示
- 每项附带检测证据（括号内简短说明）
- conflicts 字段非空时，必须在确认表中单独列出「⚠️ 冲突项」区块
- 值为 none / false / [] 的字段归入「未检测到」一行统一列出，不单独占行
- 引擎版本从 tech_stack_report.engine.version 读取，读不到显示「版本未知」
---

## Step 2：遗漏项补充（只问缺口，不重复确认）

Step 2 只负责补充当前 `tech_stack_report` 里仍然缺失的内容：

- Step 1 没检测到、但对后续 skill 生成有影响的分组
- Step 1 冲突未解决、仍然没有答案的分组
- Step 1 自然语言修正后，仍然存在空白或不确定值的分组

**禁止**把 Step 1 已确认正确的内容重新做问卷。
**禁止**把用户刚刚已经自然语言修正过的字段，再用同一题目重新确认一次。

进入 Step 2 前，先基于最新的 `tech_stack_report` 建立：

- `confirmed_groups`：Step 1 已确认或已通过自然语言修正写回的分组
- `missing_groups`：当前仍为 `none / false / [] / unknown`，且会影响 skill 生成判断的分组
- `unresolved_groups`：冲突仍未解决、或证据不足以决定的分组

只有 `missing_groups` 和 `unresolved_groups` 可以进入 Step 2。**只展示与当前技术栈相关的分组，不相关的跳过。**

每个分组独立调用一次 `AskUserQuestion`（type: multi_select），选项末尾统一加上「暂未确定」供用户跳过。

### Step 2 提问文案规则

- 题目统一写成「{分组名}（当前未检测到或仍不确定，可补充）」。
- 如果某个选项有物理证据但在 Step 1 没得到最终确认，可以标注为「检测到：{evidence}」。
- 已在 Step 1 确认过、或已被用户自然语言修正过的选项，不要在 Step 2 再标成默认预选，也不要再单独提问。
- Step 2 的目标是补遗漏，不是重跑一遍完整技术栈问卷。

### 各分组触发规则

**如果 `lua_bridge` 属于 `missing_groups` 或 `unresolved_groups`，调用：**
```
AskUserQuestion(
  type: multi_select,
  question: "Lua 桥接方式（当前未检测到或仍不确定，可补充）",
  options: ["xLua", "tolua", "SLua", "自研桥接层", "暂未确定"]
)
```

**如果 `tech_stack_report.engine.name == unity` 且 `ui_frameworks` 属于 `missing_groups` 或 `unresolved_groups`，调用：**
```
AskUserQuestion(
  type: multi_select,
  question: "UI 框架（当前未检测到或仍不确定，可补充）",
  options: ["UGUI", "FairyGUI", "UI Toolkit", "自研 UI 框架", "暂未确定"]
)
```

**如果 `tech_stack_report.engine.name == unity` 且 `hot_update` 属于 `missing_groups` 或 `unresolved_groups`，调用：**
```
AskUserQuestion(
  type: multi_select,
  question: "热更方案（当前未检测到或仍不确定，可补充）",
  options: ["xLua 热更新", "tolua 热更新", "HybridCLR", "ILRuntime", "无热更需求", "暂未确定"]
)
```

**如果 `tech_stack_report.engine.name == unity` 且 `asset_management` 属于 `missing_groups` 或 `unresolved_groups`，调用：**
```
AskUserQuestion(
  type: multi_select,
  question: "资源管理方式（当前未检测到或仍不确定，可补充）",
  options: ["Addressables", "AssetBundle 自管理", "自研资源系统", "暂未确定"]
)
```

**如果 `config_format` 属于 `missing_groups` 或 `unresolved_groups`，调用：**
```
AskUserQuestion(
  type: multi_select,
  question: "配置表方案（当前未检测到或仍不确定，可补充）",
  options: ["Excel 导出", "Proto / FlatBuffers", "自定义 JSON/YAML", "无配置表", "暂未确定"]
)
```

**如果 `planning_docs` 属于 `missing_groups` 或 `unresolved_groups`，调用：**
```
AskUserQuestion(
  type: multi_select,
  question: "策划文档规范现状（当前未检测到或仍不确定，可补充）",
  options: ["有规范化的文档体系", "有但不规范", "无", "暂未确定"]
)
```

**如果 `network` 属于 `missing_groups` 或 `unresolved_groups`，调用：**
```
AskUserQuestion(
  type: multi_select,
  question: "网络层方案（当前未检测到或仍不确定，可补充）",
  options: ["自研网络框架", "Mirror / Netcode", "Godot 内置多人游戏", "无网络需求", "暂未确定"]
)
```

**如果 `tech_stack_report.engine.name == godot` 且 `godot_extra` 属于 `missing_groups` 或 `unresolved_groups`，调用：**
```
AskUserQuestion(
  type: multi_select,
  question: "Godot 项目特有配置（当前未检测到或仍不确定，可补充）",
  options: ["纯 GDScript", "GDScript + C#", "使用 Godot 内置多人游戏", "有导出配置（export_presets.cfg）", "暂未确定"]
)
```

**如果 `tech_stack_report.engine.name == unreal` 且 `unreal_extra` 属于 `missing_groups` 或 `unresolved_groups`，调用：**
```
AskUserQuestion(
  type: multi_select,
  question: "Unreal 项目特有配置（当前未检测到或仍不确定，可补充）",
  options: ["主要用 Blueprint", "主要用 C++", "Blueprint + C++ 混合", "使用了插件（Plugins/ 目录）", "暂未确定"]
)
```

**如果 `tech_stack_report.engine.name == cocos` 且 `cocos_extra` 属于 `missing_groups` 或 `unresolved_groups`，调用：**
```
AskUserQuestion(
  type: multi_select,
  question: "Cocos Creator 项目配置（当前未检测到或仍不确定，可补充）",
  options: ["TypeScript", "JavaScript", "微信小游戏平台", "有热更新方案", "暂未确定"]
)
```

**如果 `integrations` 属于 `missing_groups` 或 `unresolved_groups`，调用：**
```
AskUserQuestion(
  type: multi_select,
  question: "其他集成（当前未检测到或仍不确定，可补充）",
  options: ["MCP 工具集成", "AI pipeline / agent 工作流", "自动化测试框架", "CI/CD 流程", "无"]
)
```

---

所有遗漏项问完后直接进入 Step 3，不再对已确认分组追问。

---

## Step 3：生成 skill 文件列表

根据 Step 1 已确认的答案 + Step 2 补充/修正后的答案，动态决定需要生成哪些 skill 文件。

### 各条件对应的 skill 文件

**所有项目（必选）：**

| 文件 | 说明 |
|---|---|
| `domain/project-structure.md` | 项目目录结构和模块划分 |
| `domain/project-conventions.md` | 项目通用约定（命名、注释、提交规范等） |

**Unity 项目：**

| 文件 | 说明 |
|---|---|
| `domain/unity-project-structure.md` | Unity 项目目录组织方式 |
| `domain/unity-scene-management.md` | 场景管理和加载方式 |
| `domain/unity-lifecycle.md` | MonoBehaviour 生命周期使用约定 |
| `domain/unity-prefab-conventions.md` | Prefab 命名、组织、引用约定 |
| `domain/unity-serialization.md` | 序列化字段约定和 SO 使用规范 |

**C# 层（Unity 或其他）：**

| 文件 | 说明 |
|---|---|
| `domain/csharp-coding-rules.md` | 代码风格、命名规范、文件组织 |
| `domain/csharp-architecture.md` | C# 层架构设计（框架选型、分层约定） |
| `domain/csharp-patterns.md` | 项目常用设计模式和惯用写法 |
| `domain/csharp-async.md` | 异步处理方式（async/await / coroutine 约定） |
| `domain/csharp-testing.md` | 单元测试规范和测试组织方式 |

**Lua 层：**

| 文件 | 说明 |
|---|---|
| `domain/lua-architecture.md` | Lua 层模块组织和架构设计 |
| `domain/lua-coding-rules.md` | Lua 编码规范（命名、注释、文件结构） |
| `domain/lua-module-system.md` | 模块加载和依赖管理方式 |
| `domain/lua-gameplay-api.md` | Lua 层对外暴露的主要 API 和接口约定 |
| `domain/lua-error-handling.md` | 错误处理和日志规范 |

**xLua 桥接：**

| 文件 | 说明 |
|---|---|
| `domain/xlua-bridge-rules.md` | xLua 桥接层约定（哪些走桥接、如何组织） |
| `domain/xlua-hotfix-patterns.md` | 热补丁使用规范和注意事项 |
| `domain/xlua-interop-conventions.md` | C# 与 Lua 互调约定和最佳实践 |

**tolua 桥接：**

| 文件 | 说明 |
|---|---|
| `domain/tolua-bridge-rules.md` | tolua 桥接层约定 |
| `domain/tolua-coroutine.md` | tolua 协程使用规范 |

**SLua 桥接：**

| 文件 | 说明 |
|---|---|
| `domain/slua-bridge-rules.md` | SLua 桥接层约定 |

**UGUI：**

| 文件 | 说明 |
|---|---|
| `domain/ugui-component-rules.md` | UI 组件命名和组织约定 |
| `domain/ugui-layout-conventions.md` | 布局规范（锚点、自适应等） |
| `domain/ugui-prefab-conventions.md` | UI Prefab 组织和复用约定 |
| `domain/ugui-event-system.md` | 事件系统使用规范 |

**FairyGUI：**

| 文件 | 说明 |
|---|---|
| `domain/fairygui-component-rules.md` | FairyGUI 组件命名和组织约定 |
| `domain/fairygui-binding-patterns.md` | FairyGUI 与代码层绑定方式 |
| `domain/fairygui-export-rules.md` | 导出设置和资源管理约定 |

**UI Toolkit（Unity）：**

| 文件 | 说明 |
|---|---|
| `domain/ui-toolkit-conventions.md` | UXML/USS 命名和组织约定 |
| `domain/ui-toolkit-binding-patterns.md` | 数据绑定方式 |

**HybridCLR：**

| 文件 | 说明 |
|---|---|
| `domain/hybridclr-setup.md` | HybridCLR 配置和构建流程 |
| `domain/hybridclr-restrictions.md` | 热更代码限制和注意事项 |
| `domain/hybridclr-update-flow.md` | 热更发布和回滚流程 |

**ILRuntime：**

| 文件 | 说明 |
|---|---|
| `domain/ilruntime-setup.md` | ILRuntime 配置和初始化 |
| `domain/ilruntime-restrictions.md` | 热更代码约束和注意事项 |

**Addressables：**

| 文件 | 说明 |
|---|---|
| `domain/addressables-organization.md` | 资源分组和标签组织约定 |
| `domain/addressables-loading.md` | 加载和释放规范 |

**AssetBundle 自管理：**

| 文件 | 说明 |
|---|---|
| `domain/assetbundle-build-pipeline.md` | AssetBundle 构建流程和分包策略 |
| `domain/assetbundle-loading.md` | 运行时加载和卸载规范 |

**配置表（Excel 导出）：**

| 文件 | 说明 |
|---|---|
| `domain/config-schema.md` | 配置表字段规范和类型约定 |
| `domain/config-workflow.md` | 配置表制作、导出、热更流程 |
| `domain/config-validation.md` | 配置数据校验规范 |

**策划文档：**

| 文件 | 说明 |
|---|---|
| `domain/design-document-format.md` | 策划文档格式规范 |
| `domain/design-review-process.md` | 策划评审和变更流程 |

**网络层：**

| 文件 | 说明 |
|---|---|
| `domain/network-protocol.md` | 网络协议设计约定 |
| `domain/network-error-handling.md` | 网络异常处理规范 |

**MCP 集成：**

| 文件 | 说明 |
|---|---|
| `domain/mcp-integration.md` | MCP 工具使用规范和接口约定 |

**AI pipeline：**

| 文件 | 说明 |
|---|---|
| `domain/ai-pipeline-conventions.md` | AI 工作流设计约定 |
| `domain/agent-collaboration.md` | Agent 协作规范 |

**Godot 项目：**

| 文件 | 说明 |
|---|---|
| `domain/godot-project-structure.md` | Godot 项目目录和节点组织方式 |
| `domain/godot-scene-conventions.md` | Scene/Node 命名和组织约定 |
| `domain/godot-signals.md` | Signal 使用规范和事件通信约定 |
| `domain/gdscript-coding-rules.md` | GDScript 编码规范 |

**Unreal 项目：**

| 文件 | 说明 |
|---|---|
| `domain/unreal-project-structure.md` | Unreal 项目目录和模块组织 |
| `domain/unreal-blueprint-conventions.md` | Blueprint 命名和组织约定 |
| `domain/unreal-cpp-coding-rules.md` | C++ 编码规范（命名、模块划分） |
| `domain/unreal-gameplay-framework.md` | GameMode/GameState/PlayerController 使用约定 |

**Cocos Creator 项目：**

| 文件 | 说明 |
|---|---|
| `domain/cocos-project-structure.md` | Cocos 项目目录和资源组织方式 |
| `domain/cocos-component-conventions.md` | 组件脚本命名和挂载约定 |
| `domain/cocos-typescript-rules.md` | TypeScript 编码规范 |
| `domain/cocos-hotupdate.md` | 热更新方案配置和流程（如有） |

### 灵活性原则

上述列表是参考框架，不是固定模板。执行时必须：

1. 根据项目实际扫描结果，判断哪些 skill 真正有必要创建
2. 如果扫描发现了上表未列出的技术方案或项目特有约定，**主动创建对应 skill**，不要因为没在列表里就跳过
3. 如果某个 skill 的内容在当前项目中找不到对应代码或文档，创建空壳并在 frontmatter 中标注 `source: incomplete`
4. skill 粒度保持单一职责，一个文件只覆盖一个具体知识点，宁可多建几个小文件，不要合并成大文件

### 展示给用户确认

整理出完整的文件列表，标注每个文件的状态，用 `AskUserQuestion` 确认：

- 展示格式必须同时包含：`文件名 | 作用说明 | 状态`
- `作用说明` 优先复用上面各表中的「说明」列；如果是执行时动态新增的 skill，也必须补上一句简短用途说明
- `状态` 至少区分：`新建`、`已存在，将覆盖`、`已存在，--update 下跳过`

```
根据你的选择，将生成以下 skill 文件：

.seed/skills/domain/
  project-structure.md        | 项目目录结构和模块划分               | 新建
  project-conventions.md      | 项目通用约定（命名、注释、提交规范等） | 新建
  unity-project-structure.md  | Unity 项目目录组织方式               | 新建
  unity-prefab-conventions.md | Prefab 命名、组织、引用约定          | 新建
  csharp-coding-rules.md      | 代码风格、命名规范、文件组织          | 新建
  csharp-architecture.md      | C# 层架构设计（框架选型、分层约定）   | 新建
  lua-architecture.md         | Lua 层模块组织和架构设计             | 新建
  lua-coding-rules.md         | Lua 编码规范（命名、注释、文件结构）  | 新建
  xlua-bridge-rules.md        | xLua 桥接层约定                     | 新建
  xlua-hotfix-patterns.md     | 热补丁使用规范和注意事项             | 新建
  ugui-component-rules.md     | UI 组件命名和组织约定                | 新建
  ugui-prefab-conventions.md  | UI Prefab 组织和复用约定             | 已存在，将覆盖（--update 模式下跳过）
  config-schema.md            | 配置表字段规范和类型约定             | 新建
  ...

共 N 个文件。预计需要 3-5 分钟。

[确认生成]  [返回修改]  [取消]
```

如果 `AskUserQuestion` 不可用，改为普通文本：

```text
根据你的选择，将生成以上 skill 文件。
请按「文件名 | 作用说明 | 状态」格式展示完整列表。

请直接回复：
  1. 确认生成
  2. 返回修改
  3. 取消
```

- **确认生成** → 进入 Step 4
- **返回修改** → 回到 Step 2 重新勾选
- **取消** → 中止流程

---

## Step 4：启动 Agent Team 并行生成

用户确认后，使用 Seed 的 CC 原生 agent team 机制并行生成 skill 文件。

如果当前环境无法使用 `TeamCreate` / `TaskCreate` / `SendMessage`，不要中止。改为当前会话串行执行以下工作：

1. 按 Step 3 确认的文件列表逐个生成 `.seed/skills/domain/` 文件
2. 仍然遵守本文后续的 skill 文件格式规范
3. 在最终摘要中明确说明：本次因 Team 能力不可用，已使用单 agent 降级模式完成

### 4.1 创建 Team

```
TeamCreate("seed-embed")
```

### 4.2 根据需要生成的 skill 文件，动态决定派出哪些 researcher/builder

只派出与生成列表相关的 agent。例如，如果没有 Lua 相关 skill 要生成，就不派 researcher-lua 和 builder-lua。

以下是完整的分工表（按需裁剪）：

---

### 4.3 派出 Researcher 并行扫描

所有 researcher 使用 `disallowedTools: Write, Edit, MultiEdit`，只读不写，产出调查报告交给对应 builder。

所有 researcher 任务 **无依赖**，全部并行。

**TaskCreate → researcher-unity**

每个 TaskCreate 的描述必须严格按 `templates/task.md` 的 10 字段格式填写：

```
Task Kind: investigate
Expected Owner Role: researcher
Deliverable: Unity/C# 调查报告（SendMessage 给 builder-unity）
Done Definition: 报告涵盖目录结构、MonoBehaviour 约定、Prefab 规范、C# 架构、UI 框架、序列化约定、异步处理、设计模式等维度
Dependencies: none
Risk Level: low
Leader Ack Required: false
Original User Intent: 分析项目 Unity/C# 技术栈，为生成 skill 文件提供依据
Scope Coverage: Unity 项目结构、场景管理、生命周期约定、Prefab 组织、序列化规范、C# 编码风格、架构分层、设计模式、异步处理、测试规范
Exclusions: Lua 层代码、配置表数据、基础设施
```

扫描指令：
```
扫描 Unity / C# 相关代码和配置，提炼：
- 项目目录结构和模块划分
- MonoBehaviour 使用约定
- Prefab 组织和命名规范
- UI 组件结构（UGUI / FairyGUI / UI Toolkit）
- 序列化字段和 ScriptableObject 使用约定
- C# 架构分层和设计模式
- 异步处理方式（async/await vs coroutine）
- 测试代码组织方式
产出：Unity/C# 调查报告
```

---

**TaskCreate → researcher-lua**

```
Task Kind: investigate
Expected Owner Role: researcher
Deliverable: Lua 调查报告（SendMessage 给 builder-lua）
Done Definition: 报告涵盖 Lua 模块组织、桥接层约定、热更模式、互调方式、错误处理等维度
Dependencies: none
Risk Level: low
Leader Ack Required: false
Original User Intent: 分析项目 Lua 技术栈，为生成 skill 文件提供依据
Scope Coverage: Lua 模块组织、桥接层（xLua/tolua/SLua）、热更新模式、C#-Lua 互调、错误处理、日志规范
Exclusions: 纯 C# 层代码、Unity Editor 功能、配置表数据
```

扫描指令：
```
扫描 Lua 相关代码，提炼：
- Lua 模块组织和依赖管理方式
- 桥接层（xLua / tolua）调用约定
- 热更新模式和注意事项
- Lua 与 C# 互调方式
- Lua 层错误处理和日志规范
- Lua 层对外暴露的主要 API
产出：Lua 调查报告
```

---

**TaskCreate → researcher-config**

```
Task Kind: investigate
Expected Owner Role: researcher
Deliverable: 配置/策划调查报告（SendMessage 给 builder-config）
Done Definition: 报告涵盖配置表格式、导出工具链、策划文档规范、数据校验规则等维度
Dependencies: none
Risk Level: low
Leader Ack Required: false
Original User Intent: 分析项目配置表和策划文档体系，为生成 skill 文件提供依据
Scope Coverage: 配置表格式和字段约定、数据导出工具链、策划文档规范和模板、数据校验规则
Exclusions: 运行时代码逻辑、Unity 场景配置、网络协议
```

扫描指令：
```
扫描配置表、策划文档、数据目录，提炼：
- 配置表格式和字段约定
- 数据导出工具链和流程
- 策划文档规范和模板
- 数据校验规则
产出：配置/策划调查报告
```

---

**TaskCreate → researcher-infra**

```
Task Kind: investigate
Expected Owner Role: researcher
Deliverable: 基础设施调查报告（SendMessage 给 builder-infra）
Done Definition: 报告涵盖资源管理、构建流程、CI/CD、网络层、其他工具链等维度
Dependencies: none
Risk Level: low
Leader Ack Required: false
Original User Intent: 分析项目基础设施，为生成 skill 文件提供依据
Scope Coverage: 资源管理方式（Addressables/AssetBundle）、构建和热更发布流程、CI/CD 配置、网络层协议、其他工具链
Exclusions: 游戏逻辑代码、Lua 层实现、UI 组件细节
```

扫描指令：
```
扫描工程基础设施，提炼：
- 资源管理方式（Addressables / AssetBundle）
- 构建和热更发布流程
- CI/CD 配置
- 网络层协议和约定
- MCP 工具集成方式
- AI pipeline / agent 工作流约定
- 其他工具链规范
产出：基础设施调查报告
```

---

**TaskCreate → researcher-godot**（仅 `tech_stack_report.engine.name == godot` 时派出）

```
Task Kind: investigate
Expected Owner Role: researcher
Deliverable: Godot 调查报告（SendMessage 给 builder-godot）
Done Definition: 报告涵盖 Godot 项目结构、Scene/Node 约定、GDScript 编码规范、Signal 使用、导出配置等维度
Dependencies: none
Risk Level: low
Leader Ack Required: false
Original User Intent: 分析项目 Godot 技术栈，为生成 skill 文件提供依据
Scope Coverage: Godot 项目结构、Scene/Node 命名组织、GDScript 编码规范、Signal 使用规范、C# 集成（如有）、导出配置
Exclusions: 非 Godot 引擎相关内容
```

扫描指令：
```
扫描 Godot 项目代码和配置，提炼：
- 项目目录结构和节点组织方式
- Scene/Node 命名和层级约定
- GDScript 编码风格和命名规范
- Signal 使用模式和事件通信约定
- C# 集成方式（如有 .csproj）
- 导出配置（export_presets.cfg）
产出：Godot 调查报告
```

---

**TaskCreate → researcher-unreal**（仅 `tech_stack_report.engine.name == unreal` 时派出）

```
Task Kind: investigate
Expected Owner Role: researcher
Deliverable: Unreal 调查报告（SendMessage 给 builder-unreal）
Done Definition: 报告涵盖 Unreal 项目结构、Blueprint 约定、C++ 模块划分、Gameplay Framework 使用等维度
Dependencies: none
Risk Level: low
Leader Ack Required: false
Original User Intent: 分析项目 Unreal 技术栈，为生成 skill 文件提供依据
Scope Coverage: Unreal 项目结构、Blueprint 命名组织、C++ 编码规范和模块划分、GameMode/GameState/PlayerController 使用约定、插件使用
Exclusions: 非 Unreal 引擎相关内容
```

扫描指令：
```
扫描 Unreal 项目代码和配置，提炼：
- 项目目录结构和模块组织
- Blueprint 命名和组织约定
- C++ 编码规范（命名、模块划分、头文件约定）
- Gameplay Framework 使用方式（GameMode/GameState/PlayerController）
- 插件使用情况（Plugins/ 目录）
产出：Unreal 调查报告
```

---

**TaskCreate → researcher-cocos**（仅 `tech_stack_report.engine.name == cocos` 时派出）

```
Task Kind: investigate
Expected Owner Role: researcher
Deliverable: Cocos Creator 调查报告（SendMessage 给 builder-cocos）
Done Definition: 报告涵盖 Cocos 项目结构、组件约定、TypeScript 规范、热更方案等维度
Dependencies: none
Risk Level: low
Leader Ack Required: false
Original User Intent: 分析项目 Cocos Creator 技术栈，为生成 skill 文件提供依据
Scope Coverage: Cocos 项目结构、组件脚本命名和挂载约定、TypeScript/JavaScript 编码规范、热更方案、小游戏平台适配
Exclusions: 非 Cocos 引擎相关内容
```

扫描指令：
```
扫描 Cocos Creator 项目代码和配置，提炼：
- 项目目录结构和资源组织方式
- 组件脚本命名和挂载约定
- TypeScript/JavaScript 编码规范
- 热更新方案配置和流程（如有）
- 小游戏平台适配（如有）
产出：Cocos Creator 调查报告
```

---

### 4.4 派出 Builder 落笔写文件

各 builder 依赖对应 researcher 完成，builder 之间并行。

**TaskCreate → builder-unity**（依赖 researcher-unity 完成）

```
Task Kind: implement
Expected Owner Role: builder
Deliverable: Unity/C# 相关的 domain skill 文件，写入 .seed/skills/domain/
Done Definition: 所有 Step 3 确认的 Unity/C# 相关 skill 文件已创建，内容基于 researcher 报告，格式符合 skill frontmatter 规范
Dependencies: researcher-unity
Risk Level: low
Leader Ack Required: false
Original User Intent: 生成项目专属的 Unity/C# domain skill 文件
Scope Coverage: unity-project-structure, unity-scene-management, unity-lifecycle, unity-prefab-conventions, unity-serialization, csharp-coding-rules, csharp-architecture, csharp-patterns, csharp-async, csharp-testing, ugui-*, fairygui-*, ui-toolkit-*, ilruntime-*
Exclusions: Lua 相关 skill、配置表 skill、基础设施 skill
```

指令：
```
根据 researcher-unity 的报告，生成对应的 skill 文件。
每个文件必须包含 YAML frontmatter（name, description, triggers, domain, scope, source）和正文内容。
source 字段：如果有充分依据填 "scanned"，如果信息不完整填 "incomplete"。
以及报告中发现的其他需要记录的方面，灵活创建对应 skill 文件。
```

---

**TaskCreate → builder-lua**（依赖 researcher-lua 完成）

```
Task Kind: implement
Expected Owner Role: builder
Deliverable: Lua 相关的 domain skill 文件，写入 .seed/skills/domain/
Done Definition: 所有 Step 3 确认的 Lua 相关 skill 文件已创建，内容基于 researcher 报告
Dependencies: researcher-lua
Risk Level: low
Leader Ack Required: false
Original User Intent: 生成项目专属的 Lua domain skill 文件
Scope Coverage: lua-architecture, lua-coding-rules, lua-module-system, lua-gameplay-api, lua-error-handling, xlua-bridge-rules, xlua-hotfix-patterns, xlua-interop-conventions, tolua-*
Exclusions: C# 层 skill、Unity 编辑器 skill
```

指令：
```
根据 researcher-lua 的报告，生成对应的 skill 文件。
每个文件必须包含 YAML frontmatter（name, description, triggers, domain, scope, source）和正文内容。
source 字段：如果有充分依据填 "scanned"，如果信息不完整填 "incomplete"。
以及报告中发现的其他需要记录的方面，灵活创建对应 skill 文件。
```

---

**TaskCreate → builder-config**（依赖 researcher-config 完成）

```
Task Kind: implement
Expected Owner Role: builder
Deliverable: 配置/策划相关的 domain skill 文件，写入 .seed/skills/domain/
Done Definition: 所有 Step 3 确认的配置/策划相关 skill 文件已创建，内容基于 researcher 报告
Dependencies: researcher-config
Risk Level: low
Leader Ack Required: false
Original User Intent: 生成项目专属的配置和策划 domain skill 文件
Scope Coverage: config-schema, config-workflow, config-validation, design-document-format, design-review-process
Exclusions: 运行时代码 skill、基础设施 skill
```

指令：
```
根据 researcher-config 的报告，生成对应的 skill 文件。
每个文件必须包含 YAML frontmatter（name, description, triggers, domain, scope, source）和正文内容。
source 字段：如果有充分依据填 "scanned"，如果信息不完整填 "incomplete"。
以及报告中发现的其他需要记录的方面，灵活创建对应 skill 文件。
```

---

**TaskCreate → builder-infra**（依赖 researcher-infra 完成）

```
Task Kind: implement
Expected Owner Role: builder
Deliverable: 基础设施相关的 domain skill 文件，写入 .seed/skills/domain/
Done Definition: 所有 Step 3 确认的基础设施相关 skill 文件已创建（含 project-structure 和 project-conventions），内容基于 researcher 报告
Dependencies: researcher-infra
Risk Level: low
Leader Ack Required: false
Original User Intent: 生成项目专属的基础设施 domain skill 文件
Scope Coverage: project-structure, project-conventions, addressables-organization, addressables-loading, network-protocol, network-error-handling, mcp-integration, ai-pipeline-conventions, agent-collaboration
Exclusions: 游戏逻辑 skill、Lua 层 skill
```

指令：
```
根据 researcher-infra 的报告，生成对应的 skill 文件。
project-structure.md 和 project-conventions.md 是所有项目必选项，必须生成。
每个文件必须包含 YAML frontmatter（name, description, triggers, domain, scope, source）和正文内容。
source 字段：如果有充分依据填 "scanned"，如果信息不完整填 "incomplete"。
以及报告中发现的其他需要记录的方面，灵活创建对应 skill 文件。
```

---

**TaskCreate → builder-godot**（依赖 researcher-godot 完成；仅 `tech_stack_report.engine.name == godot` 时派出）

```
Task Kind: implement
Expected Owner Role: builder
Deliverable: Godot 相关的 domain skill 文件，写入 .seed/skills/domain/
Done Definition: 所有 Step 3 确认的 Godot 相关 skill 文件已创建，内容基于 researcher 报告
Dependencies: researcher-godot
Risk Level: low
Leader Ack Required: false
Original User Intent: 生成项目专属的 Godot domain skill 文件
Scope Coverage: godot-project-structure, godot-scene-conventions, godot-signals, gdscript-coding-rules
Exclusions: 非 Godot 引擎相关 skill
```

指令：
```
根据 researcher-godot 的报告，生成对应的 skill 文件。
每个文件必须包含 YAML frontmatter（name, description, triggers, domain, scope, source）和正文内容。
source 字段：如果有充分依据填 "scanned"，如果信息不完整填 "incomplete"。
以及报告中发现的其他需要记录的方面，灵活创建对应 skill 文件。
```

---

**TaskCreate → builder-unreal**（依赖 researcher-unreal 完成；仅 `tech_stack_report.engine.name == unreal` 时派出）

```
Task Kind: implement
Expected Owner Role: builder
Deliverable: Unreal 相关的 domain skill 文件，写入 .seed/skills/domain/
Done Definition: 所有 Step 3 确认的 Unreal 相关 skill 文件已创建，内容基于 researcher 报告
Dependencies: researcher-unreal
Risk Level: low
Leader Ack Required: false
Original User Intent: 生成项目专属的 Unreal domain skill 文件
Scope Coverage: unreal-project-structure, unreal-blueprint-conventions, unreal-cpp-coding-rules, unreal-gameplay-framework
Exclusions: 非 Unreal 引擎相关 skill
```

指令：
```
根据 researcher-unreal 的报告，生成对应的 skill 文件。
每个文件必须包含 YAML frontmatter（name, description, triggers, domain, scope, source）和正文内容。
source 字段：如果有充分依据填 "scanned"，如果信息不完整填 "incomplete"。
以及报告中发现的其他需要记录的方面，灵活创建对应 skill 文件。
```

---

**TaskCreate → builder-cocos**（依赖 researcher-cocos 完成；仅 `tech_stack_report.engine.name == cocos` 时派出）

```
Task Kind: implement
Expected Owner Role: builder
Deliverable: Cocos Creator 相关的 domain skill 文件，写入 .seed/skills/domain/
Done Definition: 所有 Step 3 确认的 Cocos 相关 skill 文件已创建，内容基于 researcher 报告
Dependencies: researcher-cocos
Risk Level: low
Leader Ack Required: false
Original User Intent: 生成项目专属的 Cocos Creator domain skill 文件
Scope Coverage: cocos-project-structure, cocos-component-conventions, cocos-typescript-rules, cocos-hotupdate
Exclusions: 非 Cocos 引擎相关 skill
```

指令：
```
根据 researcher-cocos 的报告，生成对应的 skill 文件。
每个文件必须包含 YAML frontmatter（name, description, triggers, domain, scope, source）和正文内容。
source 字段：如果有充分依据填 "scanned"，如果信息不完整填 "incomplete"。
以及报告中发现的其他需要记录的方面，灵活创建对应 skill 文件。
```

---

### 4.5 Leader Closeout（依赖所有实际派出的 builder 完成）

```
Task Kind: closeout
Expected Owner Role: leader
Deliverable: 完成摘要（发送给用户）
Done Definition: 所有 skill 文件已检查，内容不完整的已标注 source: incomplete，输出完成摘要
Dependencies: 所有实际派出的 builder（根据引擎和技术栈动态决定，如 builder-unity, builder-lua, builder-godot 等）
Risk Level: low
Leader Ack Required: true
Original User Intent: 确认所有 domain skill 文件已正确生成
Scope Coverage: 全部生成的 skill 文件
Exclusions: 无
```

指令：
```
- 检查所有 skill 文件是否已生成
- 内容不完整的文件标注 source: incomplete
- 整理完成摘要（成功 / 待补充 / 失败列表）
- TeamDelete("seed-embed")
```

---

### 4.6 向 Leader 发送启动消息

```
SendMessage → leader：
  目标：分析项目技术栈，生成 domain skill 文件

  researcher 分工（按需派出）：
    researcher-unity  → Unity/C# 方向（engine == unity）
    researcher-lua    → Lua 方向（lua_bridge != none）
    researcher-config → 配置/策划方向（所有项目）
    researcher-infra  → 基础设施方向（所有项目）
    researcher-godot  → Godot 方向（engine == godot）
    researcher-unreal → Unreal 方向（engine == unreal）
    researcher-cocos  → Cocos 方向（engine == cocos）

  builder 分工（按需派出，依赖对应 researcher）：
    builder-unity   → 生成 Unity/C# skill
    builder-lua     → 生成 Lua skill
    builder-config  → 生成配置/策划 skill
    builder-infra   → 生成基础设施 skill
    builder-godot   → 生成 Godot skill
    builder-unreal  → 生成 Unreal skill
    builder-cocos   → 生成 Cocos skill
  Closeout 标准：
    所有 skill 文件已落盘
    内容不完整的标注 source: incomplete
    输出完成摘要
```

---

## Step 5：完成摘要

Team 完成后，输出最终摘要：

```
✅ /seed:embed 完成

生成了 N 个 domain skill：
  ✅ domain/project-structure.md
  ✅ domain/csharp-coding-rules.md
  ✅ domain/lua-architecture.md
  ✅ domain/xlua-bridge-rules.md
  ⚠️  domain/config-schema.md（内容待补充，未找到配置表相关代码）
  ...

标注 ⚠️ 的文件内容不完整，建议根据项目实际情况手动补充。
后续可随时运行 /seed:embed --update 补充新增模块的 skill。
```

---

## 生成的 skill 文件格式规范

每个生成的 domain skill 文件必须遵循以下格式：

```yaml
---
name: {skill-name}
description: {一句话描述}
triggers:
  - {关键词1}
  - {关键词2}
  - {关键词3}
domain:
  - {对应的 domain，如 unity-runtime / lua-gameplay / architecture 等}
scope:
  - user-chat
  - agent-inject
source: scanned | incomplete
---

## {主标题}

{正文内容 — 基于项目扫描提炼的约定和规范}
```

`source` 字段含义：
- `scanned`：内容基于项目实际代码扫描得出，有充分依据
- `incomplete`：在项目中未找到对应代码或文档，内容待补充

所有文件写入 `.seed/skills/domain/` 目录。
