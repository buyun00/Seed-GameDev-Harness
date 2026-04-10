---
name: embed-taxonomy-registry
description: /seed:embed 双轴矩阵 taxonomy 单一事实源
triggers:
  - embed taxonomy
  - matrix registry
  - direction registry
  - capability registry
domain:
  - project-analysis
scope:
  - agent-inject
---

# /seed:embed Taxonomy Registry

本文件是 `/seed:embed` 的**唯一分类事实源**。`detect-tech-stack.md`、`question-bank.md`、`skill-catalog.md`、`builder-catalog.md` 都必须先加载本文件，再执行各自阶段逻辑。

## 核心规则

1. 分类采用**双轴矩阵**：
   - `axis: engine`：当前主引擎的主线方向。
   - `axis: capability`：跨引擎复用的能力方向。
2. 引擎 researcher 只拥有当前引擎的主线方向；引擎主线 skill 统一由 `builder-engine` 落笔：
   - `researcher-unity` / `builder-engine`
   - `researcher-godot` / `builder-engine`
   - `researcher-unreal` / `builder-engine`
   - `researcher-cocos` / `builder-engine`
3. 跨引擎能力 owner 固定：
   - `lua_embedding` → `researcher-lua` / `builder-common`
   - `data_config_pipeline` → `researcher-config` / `builder-common`
   - `network_protocol_and_sync` → `researcher-infra` / `builder-common`
   - `build_release_and_cicd` → `researcher-infra` / `builder-common`
   - `tooling_and_ai_pipeline` → `researcher-infra` / `builder-common`
4. 文件命名固定：
   - 引擎主线：`domain/<engine>-<direction-kebab>.md`
   - 跨引擎能力：`domain/common-<capability-kebab>.md`
5. 每个 skill frontmatter 至少包含：
   - `matrix_id`
   - `axis`
   - `engine` 或 `capability`
   - `direction_id` 或 `capability_id`
   - `question_set_id`
   - `fixed_question_file`
   - `source`
6. 每个矩阵项的固定问题都按 `matrix_id` 拆成独立文件，不再维护单一总表。
7. 每个生成的 skill 都必须带 `## 固定问题` 段落，并指向对应的 `fixed_question_file`。

## 命名规则

### Engine 方向

- `matrix_id`: `engine.<engine>.<direction_id>`
- `question_set_id`: `qs-<engine>-<direction-kebab>`
- `output_file`: `domain/<engine>-<direction-kebab>.md`
- `fixed_question_file`: `$CLAUDE_PLUGIN_ROOT/skills/embed/fixed-questions/engine/<engine>/<direction-kebab>.md`
- `owner`: `researcher-<engine>` / `builder-engine`

### Capability 方向

- `matrix_id`: `capability.<capability_id>`
- `question_set_id`: `qs-common-<capability-kebab>`
- `output_file`: `domain/common-<capability-kebab>.md`
- `fixed_question_file`: `$CLAUDE_PLUGIN_ROOT/skills/embed/fixed-questions/capability/<capability-kebab>.md`
- `owner`: 见“核心规则”第 3 条

### Composite 叠加方向

当某个复合领域需要在基础矩阵项之外补充额外必查问题时，使用单独叠加文件，而不是回写总表。

- `composite_id`: `composite.<engine>.<direction_id>.<capability_id>`
- `fixed_question_file`: `$CLAUDE_PLUGIN_ROOT/skills/embed/fixed-questions/composite/<engine>/<direction-kebab>/<capability-kebab>.md`
- 用途：只放“该引擎方向 + 该能力”交叉后才成立的附加问题
- 约束：composite 文件只追加问题，不覆盖 engine/capability 基础问题

## 状态语义

所有矩阵项统一使用以下状态：

- `detected`：已找到足够物理证据，可确认项目中存在该方向实现。
- `missing`：当前引擎存在该方向，但扫描后未找到项目实现。
- `unknown`：有零散证据，但不足以确认项目采用的具体方案。
- `unsupported`：该格子没有直接对应项，或当前引擎只有默认机制但不构成项目级方案。

## 主线方向矩阵

| direction_id | Unity 对应 | Godot 对应 | Unreal 对应 | Cocos 对应 |
|---|---|---|---|---|
| `project_structure` | Assets / Packages / asmdef / 分层模块 | `project.godot` / `addons` / scene-script 分层 | `Source` / `Content` / `Config` / modules | `assets` / `settings` / bundle / extensions |
| `scene_graph_and_lifecycle` | Scene / Prefab / `Awake` `Start` `OnEnable` | Scene / Node / `_ready` `_process` / autoload | Level / World / `BeginPlay` / module startup | Scene / Node / Component / `onLoad` `start` |
| `native_code_architecture` | C# 架构、模式、异步 | GDScript 与 C# 架构、模式、异步 | C++ 模块、Subsystem、Gameplay Framework | TypeScript / JavaScript 架构、模式、异步 |
| `script_layer` | Lua / DSL / 表驱动脚本层；纯 C# 可为 `missing` | GDScript 主脚本层，或 GDScript + C# 混合 | Blueprint 脚本层 | TypeScript / JavaScript 脚本层 |
| `bridge_layer` | C# 与 Lua / 原生插件 / SDK 桥接 | GDExtension / GDNative / addon / C# bridge | Blueprint 与 C++ / 插件桥接 | JSB / 原生插件桥接 / SDK bridge |
| `ui_system` | UGUI / FairyGUI / UI Toolkit / 自研 UI | Control / Theme / 自定义 UI / addon UI | UMG / Slate / CommonUI | Widget / Layout / 自研 UI 框架 |
| `hot_reload` | HybridCLR / ILRuntime / xLua Hotfix / tolua Hotupdate | 无显式项目方案时通常 `unsupported`；如有 addon/plugin 热重载则单独记录 | Live Coding / Hot Reload / 插件热更 | 热更新脚本 / bundle patch / 原生热更 |
| `asset_pipeline` | Addressables / AssetBundle / 自研资源系统 | Resource / PackedScene / 动态加载 | Primary Asset / StreamableManager / AssetManager | Asset Bundle / `assetManager` / resources |
| `event_and_message_system` | EventBus / Signal / 消息中心 | Signal / Callable / 自研事件总线 | Delegates / Gameplay Message / GAS / Replication 事件 | EventTarget / 自研消息系统 / 全局事件 |
| `animation_system` | Animator / Timeline / Spine / DragonBones | AnimationPlayer / AnimationTree | Animation Blueprint / Montage / Sequencer | Spine / DragonBones / Timeline / Tween |
| `physics_navigation_or_runtime_framework` | Physics / Navigation / ECS / runtime framework | Physics2D/3D / NavigationServer | Physics / Navigation / Replication / GAS | Physics2D/3D / Navigation / runtime systems |
| `plugin_extension` | Package / Plugin / Editor extension | Addon / Plugin | Plugin / Module / `.uplugin` | Extension / 插件 / 原生扩展 |
| `platform_adaptation` | 小游戏 / 原生 / SDK / build target | Export preset / 平台导出适配 | Target.cs / 平台模块 / SDK 接入 | 微信小游戏 / 原生平台 / SDK / 分包 |

### 固定字段

- 所有 engine 方向都继承：
  - `axis: engine`
  - `output_file_rule: domain/<engine>-<direction-kebab>.md`
  - `fixed_question_file_rule: $CLAUDE_PLUGIN_ROOT/skills/embed/fixed-questions/engine/<engine>/<direction-kebab>.md`

## 跨引擎能力矩阵

| capability_id | 说明 | 典型方案 | owner |
|---|---|---|---|
| `lua_embedding` | Lua 作为跨引擎脚本运行时或桥接层能力 | xLua / tolua / SLua / GDLua / UnLua / 自研 Lua bridge | `lua` |
| `data_config_pipeline` | 配置表、Schema、Protobuf、导表与校验流程 | Excel / CSV / JSON / YAML / Proto / FlatBuffers / 校验脚本 | `config` |
| `network_protocol_and_sync` | 网络协议、传输层、同步框架与异常处理 | Protobuf / KCP / WebSocket / Mirror / Netcode / Godot Multiplayer / Unreal Replication | `infra` |
| `build_release_and_cicd` | 构建、打包、发布、热更产物生成、CI/CD | GitHub Actions / GitLab CI / Jenkins / UAT / export presets / Cocos build script | `infra` |
| `tooling_and_ai_pipeline` | MCP、Agent、工具链、项目自动化与 AI 工作流 | `.mcp.json` / `.seed/`（仅存在性证据） / custom tools / editor tools / automation | `infra` |

### 固定字段

- 所有 capability 方向都继承：
  - `axis: capability`
  - `engine: common`
  - `output_file_rule: domain/common-<capability-kebab>.md`
  - `fixed_question_file_rule: $CLAUDE_PLUGIN_ROOT/skills/embed/fixed-questions/capability/<capability-kebab>.md`

## 重叠边界

以下重叠允许存在，但必须各写各的事实，不得相互吞并：

- `bridge_layer` 与 `lua_embedding`
  - `bridge_layer` 写当前引擎的桥接边界、宿主入口和工程组织。
  - `lua_embedding` 写 Lua 运行时、绑定生成、热修、双向互调和 Lua 工程约定。
- `native_code_architecture` 与语言编码规范
  - C# / C++ / TS 等宿主语言的命名、分层、生命周期、异步和模块边界写入当前引擎的 `native_code_architecture`。
  - 不新增独立 language 轴。
- `script_layer` 与 `lua_embedding`
  - `script_layer` 写 Lua / GDScript / Blueprint / TS 等业务脚本层的目录、入口、模块组织和业务调用边界。
  - `lua_embedding` 只写 Lua runtime、绑定生成、C#↔Lua 双向互调和热修能力，不吞并 Lua 业务脚本架构。
- `asset_pipeline` 与 `build_release_and_cicd`
  - `asset_pipeline` 写引擎内资源组织、加载与释放。
  - `build_release_and_cicd` 写构建脚本、产物发布、流水线与自动化。
- `plugin_extension` 与 `tooling_and_ai_pipeline`
  - `plugin_extension` 写引擎插件、扩展模块和工程接入方式。
  - `tooling_and_ai_pipeline` 写工程级工具链、MCP、Agent、自动化。

## `unsupported` 规则

- 只有 registry 明确说明“无直接项目级方案”时，才允许写 `unsupported`。
- `unsupported` 不能偷懒代替 `missing`：
  - 例：Unity 项目没有 UI 框架证据，应写 `missing`，不是 `unsupported`。
  - 例：Godot 仅有 GDScript 默认脚本重载、没有独立热更方案，可写 `unsupported`。
- 如果用户在 Step 1 或 Step 2 明确补充“本项目把引擎默认机制视为规范”，可以把对应项改为 `detected` 并记录用户确认。

## `tech_stack_report` 结构

```yaml
tech_stack_report:
  engine:
    name: unity | godot | unreal | cocos | none
    version: "2022.3.15f1"
    evidence: "ProjectSettings/ProjectVersion.txt 存在"

  languages:
    primary: cs
    secondary: [lua]
    file_counts:
      cs: 342
      lua: 187

  directions:
    - matrix_id: engine.unity.project_structure
      axis: engine
      engine: unity
      direction_id: project_structure
      owner: unity
      question_set_id: qs-unity-project-structure
      fixed_question_file: $CLAUDE_PLUGIN_ROOT/skills/embed/fixed-questions/engine/unity/project-structure.md
      status: detected
      variant: "Assets + Packages + asmdef 分层"
      evidence: "Assets/Scripts/、Packages/manifest.json、*.asmdef"
      confirmed_by_user: false
      user_supplied_evidence: ""

  capabilities:
    - matrix_id: capability.lua_embedding
      axis: capability
      capability_id: lua_embedding
      owner: lua
      question_set_id: qs-common-lua-embedding
      fixed_question_file: $CLAUDE_PLUGIN_ROOT/skills/embed/fixed-questions/capability/lua-embedding.md
      status: detected
      variant: "xLua"
      evidence: "Assets/XLua/ 目录存在"
      confirmed_by_user: false
      user_supplied_evidence: ""

  conflicts: []
```

### 输出要求

- `directions` 必须输出**当前主引擎的 13 个主线方向全部项**。
- `capabilities` 必须输出 registry 中定义的跨引擎能力全部项。
- 每一项都必须填写：
  - `matrix_id`
  - `axis`
  - `owner`
  - `question_set_id`
  - `fixed_question_file`
  - `status`
  - `variant`
  - `evidence`
- 用户在 Step 1 / Step 2 补全后允许追加以下字段：
  - `confirmed_by_user`
  - `user_supplied_evidence`

### 用户补全字段语义

- `confirmed_by_user: true` 表示该矩阵项已经由用户在 Step 1 / Step 2 确认或修正，Step 3 必须读取该状态。
- `user_supplied_evidence` 保存用户补充的原始信息或整理后的信息，用于 researcher / builder 继续定位证据。
- 用户补充路径、目录、文件名、类名、函数名、配置项或关键字符串时，该项应归一化为 `status: detected`。
- 用户只补充方案名或自然语言描述时，该项应归一化为 `status: unknown`，但仍然可以进入生成列表。
- 用户明确确认不存在时，该项保持 `status: missing`，并在 `evidence` 中写明用户确认不存在。

## 固定问题文件规则

固定问题不再集中写在单一 registry 中，而是按矩阵项拆文件：

- 引擎主线：`$CLAUDE_PLUGIN_ROOT/skills/embed/fixed-questions/engine/<engine>/<direction-kebab>.md`
- 跨引擎能力：`$CLAUDE_PLUGIN_ROOT/skills/embed/fixed-questions/capability/<capability-kebab>.md`
- 复合叠加：`$CLAUDE_PLUGIN_ROOT/skills/embed/fixed-questions/composite/<engine>/<direction-kebab>/<capability-kebab>.md`

执行时：

1. 先加载矩阵项自己的 `fixed_question_file`
2. 如存在匹配的 composite 文件，再追加加载 composite 文件
3. researcher 将加载到的问题逐题回答到 `fixed_question_results`；builder 将问题与回答写入 skill 的 `## 固定问题`
4. engine / capability 基础矩阵项模板应默认预建
5. 如果对应基础文件缺失，则在 `## 固定问题` 中明确写出缺失文件路径，不得伪造问题正文
6. composite 文件允许按需创建，不要求一次性补齐全部组合
