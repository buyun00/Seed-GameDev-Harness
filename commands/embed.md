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
- 如果扫描证据不完整，也要给出“当前推断 + 不确定项”，继续进入确认步骤；**不要**无限延长扫描。
- 如果当前环境无法使用 `TeamCreate` / `TaskCreate` / `SendMessage`，必须明确告知用户，并**降级为单 agent 串行生成** `.seed/skills/domain/` 文件；**不要**静默结束。

## Step 0：扫描项目结构（静默，不展示给用户）

完成 Step 0 后，**立即**进入 Step 1；不要等待额外指令。

使用 Read / Glob / Grep 扫描项目，推断以下信息。每项都需要记录推断结果和依据。

### 扫描项

| 扫描项 | 检测方法 |
|---|---|
| **引擎类型** | `Assets/` + `*.unity` → Unity；`project.godot` → Godot；`*.uproject` → Unreal |
| **引擎版本** | Unity: `ProjectSettings/ProjectVersion.txt`；Godot: `project.godot` 中 `config_version`；Unreal: `.uproject` 中 `EngineAssociation` |
| **主要语言** | 统计 `*.cs` / `*.lua` / `*.py` / `*.ts` / `*.gd` / `*.cpp` 文件数量分布 |
| **项目阶段** | git commit 数量、是否有 README、是否有 build 产物 |
| **Lua 桥接** | 检测 `xlua` / `tolua` / `slua` 目录或 package 引用 |
| **UI 框架** | 检测 `FairyGUI` / `UGUI` / `UI Toolkit` 相关目录或 package |
| **热更方案** | 检测 `HybridCLR` / `ILRuntime` / xlua 热补丁相关目录 |
| **资源管理** | 检测 `Addressables` 配置或 AssetBundle 构建脚本 |
| **配置表** | 检测 Excel 文件、proto 文件、json 数据目录 |
| **策划文档** | 检测 `doc/` `design/` `策划/` 等目录 |
| **MCP 集成** | 检测 `.mcp.json` 或 mcp 相关配置 |
| **AI pipeline** | 检测 `.seed/` 或 agent 相关目录 |
| **网络层** | 检测 Mirror / Netcode / 自研网络框架相关引用 |

---

## Step 1：大方向确认（扫描后一次性确认）

把 Step 0 的推断结果整理成一张确认表，用 `AskUserQuestion` 一次性展示：

```
根据项目扫描，Seed 推断了以下技术栈，请确认是否正确：

  引擎：      Unity 2022.3
  语言：      C# / Lua
  项目阶段：  开发中

[确认正确，继续]  [有需要修改的地方]
```

如果 `AskUserQuestion` 不可用，改为普通文本：

```text
根据项目扫描，Seed 推断了以下技术栈，请确认是否正确：

  引擎：      Unity 2022.3
  语言：      C# / Lua
  项目阶段：  开发中

请直接回复：
  1. 确认正确，继续
  2. 有需要修改的地方
```

如果用户选"有需要修改的地方"，展示可选项让用户一次性修正：

```
请修正以下信息：

引擎
  ( ) Unity    ( ) Godot    ( ) Unreal    ( ) 无引擎    ( ) 其他

语言（可多选）
  [ ] C#    [ ] Lua    [ ] Python    [ ] TypeScript    [ ] GDScript    [ ] C++    [ ] 其他

项目阶段
  ( ) 原型/立项    ( ) 开发中    ( ) 运营中    ( ) 重构/迁移
```

确认后进入 Step 2。

---

## Step 2：技术细节勾选（一次性列表）

根据 Step 1 确认的技术栈，把所有相关细节整合成一张列表，一次性用 `AskUserQuestion` 展示让用户勾选。

**只展示与当前技术栈相关的分组**，不相关的分组不显示。

```
请勾选项目使用的技术方案（可多选，暂未确定的留空即可）：

【Lua 桥接】（检测到项目包含 Lua）
  [ ] xLua
  [ ] tolua
  [ ] SLua
  [ ] 自研桥接层

【UI 框架】
  [ ] UGUI
  [ ] FairyGUI
  [ ] UI Toolkit
  [ ] 自研 UI 框架

【热更方案】
  [ ] xLua 热更新
  [ ] HybridCLR
  [ ] ILRuntime
  [ ] 无热更需求

【资源管理】
  [ ] Addressables
  [ ] AssetBundle 自管理
  [ ] 自研资源系统

【配置表】
  [ ] Excel 导出（如 ET、QFramework 等工具链）
  [ ] Proto / FlatBuffers
  [ ] 自定义 JSON/YAML 格式
  [ ] 无配置表

【策划文档】
  [ ] 有规范化的策划文档体系
  [ ] 有但不规范
  [ ] 无

【网络层】（如果是联网游戏）
  [ ] 自研网络框架
  [ ] Mirror / Netcode（Unity）
  [ ] Godot 内置多人游戏
  [ ] 无网络需求

【其他集成】
  [ ] MCP 工具集成
  [ ] AI pipeline / agent 工作流
  [ ] 自动化测试框架
  [ ] CI/CD 流程
```

如果 `AskUserQuestion` 不可用，改为普通文本多选，要求用户直接回复逗号分隔的选项名或编号。

用户勾选完成后直接进入 Step 3，不再追问。

---

## Step 3：生成 skill 文件列表

根据 Step 1 + Step 2 的答案，动态决定需要生成哪些 skill 文件。

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

**HybridCLR：**

| 文件 | 说明 |
|---|---|
| `domain/hybridclr-setup.md` | HybridCLR 配置和构建流程 |
| `domain/hybridclr-restrictions.md` | 热更代码限制和注意事项 |
| `domain/hybridclr-update-flow.md` | 热更发布和回滚流程 |

**Addressables：**

| 文件 | 说明 |
|---|---|
| `domain/addressables-organization.md` | 资源分组和标签组织约定 |
| `domain/addressables-loading.md` | 加载和释放规范 |

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

### 灵活性原则

上述列表是参考框架，不是固定模板。执行时必须：

1. 根据项目实际扫描结果，判断哪些 skill 真正有必要创建
2. 如果扫描发现了上表未列出的技术方案或项目特有约定，**主动创建对应 skill**，不要因为没在列表里就跳过
3. 如果某个 skill 的内容在当前项目中找不到对应代码或文档，创建空壳并在 frontmatter 中标注 `source: incomplete`
4. skill 粒度保持单一职责，一个文件只覆盖一个具体知识点，宁可多建几个小文件，不要合并成大文件

### 展示给用户确认

整理出完整的文件列表，标注每个文件的状态，用 `AskUserQuestion` 确认：

```
根据你的选择，将生成以下 skill 文件：

.seed/skills/domain/
  project-structure.md          ← 新建
  project-conventions.md        ← 新建
  unity-project-structure.md    ← 新建
  unity-prefab-conventions.md   ← 新建
  csharp-coding-rules.md        ← 新建
  csharp-architecture.md        ← 新建
  lua-architecture.md           ← 新建
  lua-coding-rules.md           ← 新建
  xlua-bridge-rules.md          ← 新建
  xlua-hotfix-patterns.md       ← 新建
  ugui-component-rules.md       ← 新建
  ugui-prefab-conventions.md    ← 已存在，将覆盖（--update 模式下跳过）
  config-schema.md              ← 新建
  ...

共 N 个文件。预计需要 3-5 分钟。

[确认生成]  [返回修改]  [取消]
```

如果 `AskUserQuestion` 不可用，改为普通文本：

```text
根据你的选择，将生成以上 skill 文件。

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
Scope Coverage: Lua 模块组织、桥接层（xLua/tolua）、热更新模式、C#-Lua 互调、错误处理、日志规范
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
Scope Coverage: unity-project-structure, unity-scene-management, unity-lifecycle, unity-prefab-conventions, unity-serialization, csharp-coding-rules, csharp-architecture, csharp-patterns, csharp-async, csharp-testing, ugui-*, fairygui-*
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

### 4.5 Leader Closeout（依赖所有 builder 完成）

```
Task Kind: closeout
Expected Owner Role: leader
Deliverable: 完成摘要（发送给用户）
Done Definition: 所有 skill 文件已检查，内容不完整的已标注 source: incomplete，输出完成摘要
Dependencies: builder-unity, builder-lua, builder-config, builder-infra
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
  researcher 分工：
    researcher-unity  → Unity/C# 方向
    researcher-lua    → Lua 方向
    researcher-config → 配置/策划方向
    researcher-infra  → 基础设施方向
  builder 分工：
    builder-unity   → 依赖 researcher-unity，生成 Unity/C# skill
    builder-lua     → 依赖 researcher-lua，生成 Lua skill
    builder-config  → 依赖 researcher-config，生成配置/策划 skill
    builder-infra   → 依赖 researcher-infra，生成基础设施 skill
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
