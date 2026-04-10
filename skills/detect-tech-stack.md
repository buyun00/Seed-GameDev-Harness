---
name: detect-tech-stack
description: 确定性技术栈指纹检测规则，供 /seed:embed Step 0 调用
triggers:
  - 技术栈检测
  - 引擎识别
  - 框架指纹
  - embed Step 0
domain:
  - project-analysis
scope:
  - agent-inject
---

# Detect Tech Stack

本文件负责 `/seed:embed` Step 0 的结构化检测。执行前必须先加载 [`$CLAUDE_PLUGIN_ROOT/skills/embed/taxonomy-registry.md`]($CLAUDE_PLUGIN_ROOT/skills/embed/taxonomy-registry.md)，所有方向命名、owner、状态语义、文件命名都以 registry 为准。

## 核心原则

1. **只做物理查找**：所有结论都来自文件存在、目录存在、字符串命中、配置字段读取。
2. **找到即记录证据路径**：`evidence` 只能写真实路径或命中串，禁止写“推测”“常见做法”。
3. **先引擎、后方向**：先确定主引擎，再只展开该引擎的 13 个主线方向。
4. **跨引擎能力独立检测**：Lua、配置、网络、CI/CD、工具链必须写入 `capabilities`，不能借道某个引擎方向。
5. **冲突全部保留**：如果同一矩阵项命中多个互斥变体，写入 `conflicts`，交给 Step 1 用户确认。

## 扫描边界

以下目录是 Seed / Claude / 缓存 / 生成产物，不属于被分析游戏项目的业务技术栈。除非某条规则明确说明“只做存在性检查”，否则所有 Phase 都必须排除这些目录及其子目录：

- `.seed/`
- `.claude/`
- `.claude-plugin/`
- `Library/`
- `Temp/`
- `Logs/`
- `Obj/`
- `node_modules/`
- `DerivedDataCache/`
- `.git/`

特别约束：

- `.seed/skills/`、`.seed/state/`、`.seed/logs/`、`.seed/plans/` 中的任何文本都不得作为 `lua_embedding`、引擎方向、配置、网络或构建能力的证据。
- `tooling_and_ai_pipeline` 可以把项目根目录存在 `.seed/`、`.seed/config.json`、`.seed/team-router.md` 作为 Seed 工具链证据，但不得递归读取 `.seed/skills/` 中的 generated skill 内容来判断其它能力。
- 如果某次扫描命中的证据路径位于上述排除目录内，必须丢弃该证据；如果因此只剩 `.seed/` 证据，则只能影响 `tooling_and_ai_pipeline`。

## 状态规则

- `detected`：命中足够证据，能确认该方向存在项目实现。
- `missing`：该方向在当前引擎有直接对应，但扫描后未找到项目实现。
- `unknown`：命中零散证据，但不足以确认变体或真实入口。
- `unsupported`：registry 认定无直接项目级方案，或当前只有引擎默认机制且不计入项目方案。

## Phase 1：识别主引擎

按顺序检查，找到即停：

1. `ProjectSettings/ProjectVersion.txt`
   - 命中 → `engine.name = unity`
   - 版本 → 读取 `m_EditorVersion`
2. `project.godot`
   - 命中 → `engine.name = godot`
   - 版本 → 读取 `config_version`
3. 项目根目录 `*.uproject`
   - 命中 → `engine.name = unreal`
   - 版本 → 读取 `EngineAssociation`
4. `package.json` 中包含 `creator` 或 `cocos`
   - 命中 → `engine.name = cocos`
   - 版本 → 读取 `package.json` 的 `version`
5. 以上全未命中
   - `engine.name = none`

## Phase 2：统计语言分布

统计以下扩展名数量，必须遵守“扫描边界”，排除 `.seed/`、`.claude/`、`.claude-plugin/`、`Library/`、`Temp/`、`node_modules/`、`.git/`、常见三方缓存目录：

| 扩展名 | 语言 |
|---|---|
| `*.cs` | C# |
| `*.lua` | Lua |
| `*.gd` | GDScript |
| `*.ts` | TypeScript |
| `*.js` | JavaScript |
| `*.cpp` `*.h` | C++ |
| `*.py` | Python |

输出规则：

- 数量最多的为 `primary`
- 数量大于 0 的其余语言进入 `secondary`
- `file_counts` 只列数量大于 0 的语言

## Phase 3：当前引擎的 13 个主线方向

对 registry 中当前引擎对应的 13 个 `direction_id` 全量输出到 `directions`。每项都必须填：

- `matrix_id`
- `axis`
- `engine`
- `direction_id`
- `owner`
- `question_set_id`
- `status`
- `variant`
- `evidence`

### 检测规则

- 命中明确项目入口、管理器、资源目录、配置文件、核心 API 或宿主封装 → `detected`
- 只命中零散 API、命名词、单个资源或单个目录，无法确认工程级约定 → `unknown`
- 当前引擎该方向本应存在，但未命中实现 → `missing`
- registry 允许 `unsupported` 的格子，且项目中未找到独立方案 → `unsupported`

### Unity 方向线索

| direction_id | 主要物理证据 |
|---|---|
| `project_structure` | `Assets/` 一级目录、`Packages/manifest.json`、`*.asmdef`、`Editor/`、`Runtime/` |
| `scene_graph_and_lifecycle` | `*.unity`、`SceneManager`、`: MonoBehaviour`、`Awake(`、`Start(`、`OnEnable(`、`DontDestroyOnLoad` |
| `native_code_architecture` | `Manager`、`Service`、`System`、`Controller`、`Facade`、`UniTask`、`async`、`await` |
| `script_layer` | `*.lua`、脚本入口、表驱动 DSL、脚本加载器；纯 C# 项目可为 `missing` |
| `bridge_layer` | `LuaEnv`、`DoString`、`CSharpCallLua`、`LuaCallCSharp`、原生 SDK 封装、`DllImport` |
| `ui_system` | `UnityEngine.UI`、`using FairyGUI;`、`UnityEngine.UIElements`、`.uxml`、`.uss`、UI 基类 |
| `hot_reload` | `HybridCLR`、`ILRuntime`、`[Hotfix]`、热更发布脚本、patch loader |
| `asset_pipeline` | `com.unity.addressables`、`AddressableAssetsData/`、`BuildAssetBundles`、自研 loader/provider |
| `event_and_message_system` | `EventBus`、`Signal`、`Message`、`Dispatch`、`Broadcast`、`Notify` |
| `animation_system` | `Animator`、`AnimationClip`、`Timeline`、`PlayableDirector`、`Spine`、`DragonBones` |
| `physics_navigation_or_runtime_framework` | `Rigidbody`、`Collider`、`NavMesh`、`CharacterController`、ECS/runtime framework |
| `plugin_extension` | `Packages/`、`Plugins/`、Editor extension、SDK wrapper、package manifests |
| `platform_adaptation` | `Android/`、`iOS/`、小游戏 SDK、`#if UNITY_`、构建 target 脚本 |

### Godot 方向线索

| direction_id | 主要物理证据 |
|---|---|
| `project_structure` | `project.godot`、`addons/`、`autoload`、`*.tscn`、`*.gd`、`*.cs` |
| `scene_graph_and_lifecycle` | `*.tscn`、`_ready()`、`_process()`、`_physics_process()`、autoload 单例 |
| `native_code_architecture` | `class_name`、基础脚本、`.csproj`、C# partial、服务脚本、异步调用 |
| `script_layer` | `*.gd`、GDScript 业务入口、GDScript 与 C# 混用脚本 |
| `bridge_layer` | `GDExtension`、`GDNative`、`addons/` 插件、宿主桥接类、native bindings |
| `ui_system` | `Control`、`Theme`、UI scene、`CanvasLayer`、addon UI |
| `hot_reload` | addon/plugin hot reload、脚本 reload 管理；仅默认 GDScript reload 时可 `unsupported` |
| `asset_pipeline` | `load(`、`preload(`、`ResourceLoader`、`PackedScene`、动态资源路径 |
| `event_and_message_system` | `signal`、`connect(`、`Callable`、autoload event bus |
| `animation_system` | `AnimationPlayer`、`AnimationTree`、`Tween` |
| `physics_navigation_or_runtime_framework` | `CharacterBody`、`RigidBody`、`NavigationServer`、physics layers |
| `plugin_extension` | `addons/`、plugin config、GDExtension modules |
| `platform_adaptation` | `export_presets.cfg`、平台导出目录、平台专用脚本 |

### Unreal 方向线索

| direction_id | 主要物理证据 |
|---|---|
| `project_structure` | `*.uproject`、`Source/`、`Content/`、`Config/`、模块目录 |
| `scene_graph_and_lifecycle` | `Map`、`Level`、`BeginPlay`、`GameMode`、`WorldSubsystem`、关卡加载入口 |
| `native_code_architecture` | `Subsystem`、`ActorComponent`、`GameInstance`、`PlayerController`、模块规则 |
| `script_layer` | Blueprint 资产、蓝图父类命名、Blueprint 函数库 |
| `bridge_layer` | `BlueprintCallable`、`BlueprintImplementableEvent`、插件桥接、C++/Blueprint 边界 |
| `ui_system` | `Widget`、`UMG`、`Slate`、`CommonUI`、UI manager |
| `hot_reload` | `Live Coding` 配置、Hot Reload、插件热更脚本 |
| `asset_pipeline` | `PrimaryAsset`、`StreamableManager`、`AssetManager`、异步加载 |
| `event_and_message_system` | delegates、message subsystem、GAS ability/event、replication event |
| `animation_system` | `AnimBlueprint`、`Montage`、`Sequencer`、`StateMachine` |
| `physics_navigation_or_runtime_framework` | `CharacterMovement`、`NavigationSystem`、`Replication`、GAS、Chaos |
| `plugin_extension` | `Plugins/`、`.uplugin`、插件模块依赖 |
| `platform_adaptation` | `Target.cs`、平台模块、SDK 接入、打包脚本 |

### Cocos 方向线索

| direction_id | 主要物理证据 |
|---|---|
| `project_structure` | `assets/`、`settings/`、`extensions/`、`bundle` 目录、工具脚本 |
| `scene_graph_and_lifecycle` | `*.scene`、`*.prefab`、`onLoad()`、`start()`、`update()`、`director.loadScene` |
| `native_code_architecture` | `@ccclass`、基础 `Component`、服务层、TS/JS 工程组织、异步封装 |
| `script_layer` | `*.ts` / `*.js` 业务层、脚本入口、脚本模块划分 |
| `bridge_layer` | `jsb`、原生插件桥接、SDK wrapper、平台桥接脚本 |
| `ui_system` | `Button`、`Widget`、`Layout`、UI manager、自研 view/panel |
| `hot_reload` | `hotupdate`、manifest、patch 脚本、`jsb.AssetsManager` |
| `asset_pipeline` | `assetManager`、`resources.load`、bundle 加载、自定义资源封装 |
| `event_and_message_system` | `EventTarget`、消息中心、广播封装、全局事件 |
| `animation_system` | `Tween`、`Animation`、`Spine`、`DragonBones` |
| `physics_navigation_or_runtime_framework` | Physics2D/3D、导航或 runtime system、碰撞回调 |
| `plugin_extension` | `extensions/`、自定义插件、原生扩展、编辑器扩展 |
| `platform_adaptation` | 微信小游戏、平台宏、构建脚本、原生平台目录 |

## Phase 4：跨引擎能力线

对 registry 中 5 个 capability 全量输出到 `capabilities`。每项都必须填：

- `matrix_id`
- `axis`
- `capability_id`
- `owner`
- `question_set_id`
- `status`
- `variant`
- `evidence`

### Capability 检测规则

| capability_id | 主要物理证据 |
|---|---|
| `lua_embedding` | `Assets/XLua/`、`Assets/ToLua/`、`Assets/Slua/`、`using XLua;`、`using LuaInterface;`、`using SLua;`、`GDLua`、`UnLua`、Lua plugin/addon、`LuaEnv`、`DoString` |
| `data_config_pipeline` | `*.xlsx`、`*.xls`、`*.csv`、`*.proto`、`*.fbs`、`ExcelExport`、`TableExport`、`GenerateConfig`、批量 JSON/YAML 数据目录、校验脚本 |
| `network_protocol_and_sync` | `Mirror`、`Netcode`、`System.Net.Sockets`、`KCP`、`WebSocket`、`*.proto`、Godot `MultiplayerAPI`、Unreal replication/network subsystem |
| `build_release_and_cicd` | `.github/workflows/`、`.gitlab-ci.yml`、`Jenkinsfile`、Unity build scripts、Godot export、Unreal UAT、Cocos build/release scripts |
| `tooling_and_ai_pipeline` | `.mcp.json`、`.seed/`（仅存在性标记，不递归读取其内容）、`mcp` 目录、`agent`、`pipeline`、自动化脚本、editor tools、custom tooling |

### Capability 结果约束

- `lua_embedding`
  - 命中多个互斥实现（如 xLua + tolua）→ `conflicts`
  - 只有 Lua 文件但无已知桥接特征 → `unknown`，`variant = "custom_or_unconfirmed"`
- `data_config_pipeline`
  - 可多方案共存，`variant` 可写为组合值，如 `excel + proto`
- `network_protocol_and_sync`
  - 框架依赖和实际项目封装要尽量同时命中；只有依赖、无入口可写 `unknown`
- `build_release_and_cicd`
  - 只要构建脚本或 CI 任一存在即可 `detected`
- `tooling_and_ai_pipeline`
  - 只记录项目级工具链，不把引擎自带工具当项目能力

## Phase 5：冲突整理

以下情况必须写入 `conflicts`：

- 同一 capability 命中多个互斥实现：
  - `xLua` 与 `tolua`
  - `GDLua` 与另一套 Lua bridge
  - `UnLua` 与另一套 Lua bridge
- 同一 engine direction 命中多个互斥变体，且无法确认主入口：
  - `ui_system` 同时命中多个 UI 栈，但主 UI 管理入口不清晰
  - `hot_reload` 同时命中多套热更方案
  - `script_layer` 同时命中多套脚本层，但无法确认主要运行时

冲突格式：

```yaml
- field: capability.lua_embedding
  found: [xlua, tolua]
  reason: "Assets/XLua/ 与 Assets/ToLua/ 都存在"
```

## 输出结构

必须输出以下结构，禁止省略字段：

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
      status: detected | missing | unknown | unsupported
      variant: "Assets + Packages + asmdef 分层"
      evidence: "Assets/Scripts/、Packages/manifest.json、*.asmdef"

  capabilities:
    - matrix_id: capability.lua_embedding
      axis: capability
      capability_id: lua_embedding
      owner: lua
      question_set_id: qs-common-lua-embedding
      status: detected | missing | unknown | unsupported
      variant: "xLua"
      evidence: "Assets/XLua/ 目录存在"

  conflicts: []
```

## 额外要求

- `directions` 必须包含当前主引擎的 13 个方向，不能少项。
- `capabilities` 必须包含 5 个能力项，不能少项。
- `unsupported` 只能用于 registry 明确允许的格子，不得滥用。
- 物理证据不够时宁可写 `unknown`，不要用通用知识补全。
