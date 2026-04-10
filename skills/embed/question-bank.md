---
name: embed-question-bank
description: /seed:embed Step 2 双轴矩阵补问题库
triggers:
  - embed step2
  - matrix question bank
  - direction 补问
domain:
  - project-analysis
scope:
  - agent-inject
---

# /seed:embed Step 2 Question Bank

本文件负责 `/seed:embed` Step 2 的补问逻辑。执行前必须先加载 [`$CLAUDE_PLUGIN_ROOT/skills/embed/taxonomy-registry.md`]($CLAUDE_PLUGIN_ROOT/skills/embed/taxonomy-registry.md)。

## Step 2 目标

Step 2 不再围绕旧字段提问，而是围绕 registry 的矩阵项提问：

- `engine` 轴：只看当前主引擎的 13 个方向
- `capability` 轴：只看当前项目的活跃跨引擎能力

## 进入 Step 2 前必须建立的集合

- `confirmed_directions`
  - Step 1 已确认，或已由用户自然语言修正回写并完成状态归一化的引擎方向
- `missing_directions`
  - 当前主引擎方向中，`status = missing`
- `unresolved_directions`
  - 当前主引擎方向中，`status = unknown` 或进入 `conflicts`
- `active_capabilities`
  - 当前 `capabilities` 中 `status = detected | unknown`
  - 或 Step 1 用户明确补充“项目还有这项能力”
- `confirmed_capabilities`
  - 已确认并完成状态归一化的跨引擎能力
- `unresolved_capabilities`
  - 活跃跨引擎能力中 `status = unknown` 或进入 `conflicts`

### 用户补全归一化

Step 2 中用户对任意矩阵项的回答都必须写回 `tech_stack_report` 的对应项，且必须影响 Step 3 的生成决策。禁止只把答案记录在 `confirmed_directions` / `confirmed_capabilities` 临时集合里。

- 用户提供路径、目录、文件名、类名、函数名、配置项或关键字符串时：
  - `status = detected`
  - `evidence = "<用户提供的可验证线索>"`
  - `confirmed_by_user = true`
  - `user_supplied_evidence = "<用户回答原文或整理后的回答>"`
- 用户只提供方案名或自然语言描述时：
  - `status = unknown`
  - `variant = "<用户确认的方案>"`
  - `evidence = "用户确认：<用户回答>"`
  - `confirmed_by_user = true`
  - `user_supplied_evidence = "<用户回答原文或整理后的回答>"`
- 用户明确选择“没有独立方案 / 不使用 / 不存在”时：
  - `status = missing`
  - `evidence = "用户确认不存在：<用户回答>"`
  - `confirmed_by_user = true`

对 Unity + tolua 手游，如果用户已补充 `script_layer`、`bridge_layer`、`hot_reload`、`asset_pipeline`、`event_and_message_system`、`animation_system`、`plugin_extension`、`platform_adaptation` 中任一方向，该方向必须按上述规则改写状态，并进入 Step 3 的生成输入。

### 约束

- Step 2 **默认不追问 `status = missing` 且完全没有证据的 capability**。
- 只有当 Step 1 用户明确补充该能力存在，或检测到了部分证据时，才把它加入 `active_capabilities`。
- `unsupported` 不进入 Step 2，除非用户在 Step 1 明确要求改判。
- 已确认项禁止重复提问。

## 提问方式

- 每个矩阵项只提一次。
- 优先使用 `AskUserQuestion`；不可用时降级为普通文本。
- 降级时必须明确写出用户要回复什么，例如：
  - `回复 A/B/C`
  - `或直接用自然语言补充实际方案`

## 引擎方向题库

以下题目都遵循命名规则：

- `question_set_id = qs-<engine>-<direction-kebab>`

### `project_structure`

- 触发：当前主引擎的 `project_structure` 进入 `missing_directions` 或 `unresolved_directions`
- 问题模板：`{Engine} 项目的目录结构 / 模块划分当前未确认，实际更接近哪种组织方式？`
- 选项参考：
  - Unity：`Assets 分层 + asmdef`、`UPM / Package 模块化`、`插件/子模块混合`、`自研目录规范`、`暂未确定`
  - Godot：`scene + script 分层`、`autoload + feature folder`、`addons 驱动`、`混合组织`、`暂未确定`
  - Unreal：`Source/Content/Config 标准结构`、`多模块 Source`、`插件主导`、`混合组织`、`暂未确定`
  - Cocos：`assets + bundle 分层`、`feature folder`、`extensions/原生扩展混合`、`混合组织`、`暂未确定`

### `scene_graph_and_lifecycle`

- 问题模板：`{Engine} 的场景 / 节点 / 生命周期主路径当前未确认，主要依赖哪套入口？`
- 选项参考：
  - Unity：`SceneManager + MonoBehaviour 生命周期`、`自研场景流转封装`、`Prefab 驱动`、`暂未确定`
  - Godot：`Scene/Node + _ready/_process`、`autoload 统一入口`、`继承 scene 体系`、`暂未确定`
  - Unreal：`Level + BeginPlay`、`GameMode/GameState 主导`、`Subsystem 主导`、`暂未确定`
  - Cocos：`director.loadScene + Component 生命周期`、`自研 scene flow`、`bundle/预制体主导`、`暂未确定`

### `native_code_architecture`

- 问题模板：`{Engine} 的原生代码架构当前未确认，项目主要按什么方式组织？`
- 选项参考：
  - Unity：`C# 分层架构`、`Manager/Service 模式`、`MVC/MVVM`、`ECS/runtime framework`、`暂未确定`
  - Godot：`GDScript 主导`、`GDScript + C# 混合`、`autoload service`、`暂未确定`
  - Unreal：`C++ Gameplay Framework`、`Subsystem + Module`、`GAS / ability framework`、`暂未确定`
  - Cocos：`TypeScript 分层架构`、`Component + Manager`、`service/module 模式`、`暂未确定`

### `script_layer`

- 问题模板：`{Engine} 的脚本层当前未确认，项目主要使用哪类脚本运行时？`
- 选项参考：
  - Unity：`Lua 层`、`DSL / 表驱动脚本`、`没有独立脚本层`、`暂未确定`
  - Godot：`GDScript`、`GDScript + C# 混用`、`没有独立脚本层`、`暂未确定`
  - Unreal：`Blueprint`、`Blueprint + C++`、`没有独立脚本层`、`暂未确定`
  - Cocos：`TypeScript`、`JavaScript`、`TypeScript + JavaScript`、`暂未确定`

### `bridge_layer`

- 问题模板：`{Engine} 的桥接层当前未确认，项目主要通过什么边界和宿主/插件互通？`
- 选项参考：
  - Unity：`Lua bridge`、`原生 SDK / DllImport`、`双边都有`、`没有显式桥接层`、`暂未确定`
  - Godot：`GDExtension / GDNative`、`addon/plugin bridge`、`C# bridge`、`没有显式桥接层`、`暂未确定`
  - Unreal：`Blueprint <-> C++ bridge`、`plugin bridge`、`双边都有`、`没有显式桥接层`、`暂未确定`
  - Cocos：`JSB / 原生桥接`、`plugin bridge`、`SDK wrapper`、`没有显式桥接层`、`暂未确定`

### `ui_system`

- 问题模板：`{Engine} 的 UI 系统当前未确认，实际主要使用哪套 UI 栈？`
- 选项参考：
  - Unity：`UGUI`、`FairyGUI`、`UI Toolkit`、`多套共存`、`自研 UI`、`暂未确定`
  - Godot：`Control`、`Theme + 自定义控件`、`addon UI`、`多套共存`、`暂未确定`
  - Unreal：`UMG`、`Slate`、`CommonUI`、`多套共存`、`暂未确定`
  - Cocos：`Widget/Layout`、`自研 UI 框架`、`FairyGUI 或第三方`、`多套共存`、`暂未确定`

### `hot_reload`

- 问题模板：`{Engine} 的热更新 / 热重载方向当前未确认，项目实际采用什么方案？`
- 选项参考：
  - Unity：`HybridCLR`、`ILRuntime`、`xLua Hotfix`、`tolua Hotupdate`、`无独立热更`、`暂未确定`
  - Godot：`addon/plugin 热重载`、`自定义脚本重载`、`无独立方案（视为 unsupported）`、`暂未确定`
  - Unreal：`Live Coding`、`Hot Reload`、`插件热更`、`无独立方案`、`暂未确定`
  - Cocos：`hotupdate/patch`、`bundle patch`、`无独立方案`、`暂未确定`

### `asset_pipeline`

- 问题模板：`{Engine} 的资源管线当前未确认，项目主要通过哪套方案组织与加载资源？`
- 选项参考：
  - Unity：`Addressables`、`AssetBundle 自管`、`自研资源系统`、`默认资源方式`、`暂未确定`
  - Godot：`ResourceLoader / preload`、`PackedScene 动态加载`、`自研资源封装`、`暂未确定`
  - Unreal：`Primary Asset`、`StreamableManager`、`AssetManager`、`自研封装`、`暂未确定`
  - Cocos：`assetManager`、`resources.load`、`bundle 管线`、`自研封装`、`暂未确定`

### `event_and_message_system`

- 问题模板：`{Engine} 的模块通信方向当前未确认，项目主要通过什么方式通信？`
- 选项参考：
  - Unity：`EventBus / Signal`、`消息中心`、`直接引用 + Manager`、`暂未确定`
  - Godot：`Signal`、`autoload event bus`、`直接引用`、`暂未确定`
  - Unreal：`Delegates`、`Gameplay Message / GAS`、`Replication 事件`、`暂未确定`
  - Cocos：`EventTarget`、`消息中心`、`直接引用`、`暂未确定`

### `animation_system`

- 问题模板：`{Engine} 的动画系统当前未确认，项目主要使用哪套动画栈？`
- 选项参考：
  - Unity：`Animator`、`Timeline`、`Spine`、`DragonBones`、`多套共存`、`暂未确定`
  - Godot：`AnimationPlayer`、`AnimationTree`、`Tween`、`多套共存`、`暂未确定`
  - Unreal：`Anim Blueprint`、`Montage`、`Sequencer`、`多套共存`、`暂未确定`
  - Cocos：`Animation/Tween`、`Spine`、`DragonBones`、`多套共存`、`暂未确定`

### `physics_navigation_or_runtime_framework`

- 问题模板：`{Engine} 的物理 / 导航 / runtime framework 当前未确认，项目更偏向哪类运行时框架？`
- 选项参考：
  - Unity：`Physics + NavMesh`、`CharacterController`、`ECS/runtime framework`、`暂未确定`
  - Godot：`Physics2D/3D`、`NavigationServer`、`自研 runtime system`、`暂未确定`
  - Unreal：`CharacterMovement + Navigation`、`Replication / GAS`、`Chaos physics`、`暂未确定`
  - Cocos：`Physics2D/3D`、`自研 runtime system`、`导航/寻路封装`、`暂未确定`

### `plugin_extension`

- 问题模板：`{Engine} 的插件 / 扩展方向当前未确认，项目主要通过什么方式扩展引擎？`
- 选项参考：
  - Unity：`UPM / package`、`Plugins/SDK`、`Editor extension`、`没有显式插件层`、`暂未确定`
  - Godot：`addons`、`GDExtension`、`editor plugin`、`没有显式插件层`、`暂未确定`
  - Unreal：`Plugins`、`engine module`、`editor plugin`、`没有显式插件层`、`暂未确定`
  - Cocos：`extensions`、`原生扩展`、`editor extension`、`没有显式插件层`、`暂未确定`

### `platform_adaptation`

- 问题模板：`{Engine} 的平台适配方向当前未确认，项目主要面向哪些平台或适配层？`
- 选项参考：
  - Unity：`Android/iOS`、`小游戏平台`、`PC/Console`、`多平台混合`、`暂未确定`
  - Godot：`桌面导出`、`移动导出`、`Web/平台插件`、`多平台混合`、`暂未确定`
  - Unreal：`PC/Console`、`移动平台`、`多平台混合`、`暂未确定`
  - Cocos：`微信小游戏`、`原生平台`、`Web`、`多平台混合`、`暂未确定`

## 跨引擎能力题库

以下题目都遵循命名规则：

- `question_set_id = qs-common-<capability-kebab>`

### `lua_embedding`

- 触发：`lua_embedding` 位于 `active_capabilities` 且进入 `unresolved_capabilities`
- 问题模板：`Lua 嵌入方案当前未确认，项目实际使用哪套 Lua runtime / bridge？`
- 选项参考：
  - `xLua`
  - `tolua`
  - `SLua`
  - `GDLua`
  - `UnLua`
  - `自研 Lua bridge`
  - `暂未确定`

### `data_config_pipeline`

- 触发：`data_config_pipeline` 位于 `active_capabilities` 且进入 `unresolved_capabilities`
- 问题模板：`配置表 / Schema / 导表流程当前未确认，项目主要采用哪套数据管线？`
- 选项参考：
  - `Excel / CSV 导表`
  - `Proto / FlatBuffers`
  - `JSON / YAML 数据驱动`
  - `多套共存`
  - `暂未确定`

### `network_protocol_and_sync`

- 触发：`network_protocol_and_sync` 位于 `active_capabilities` 且进入 `unresolved_capabilities`
- 问题模板：`网络协议 / 同步方案当前未确认，项目主要采用哪条链路？`
- 选项参考：
  - `自研 Socket / KCP / TCP`
  - `Mirror / Netcode`
  - `Godot Multiplayer`
  - `Unreal Replication`
  - `WebSocket / HTTP mixed`
  - `暂未确定`

### `build_release_and_cicd`

- 触发：`build_release_and_cicd` 位于 `active_capabilities` 且进入 `unresolved_capabilities`
- 问题模板：`构建 / 发布 / CI/CD 当前未确认，项目实际依赖哪类流水线？`
- 选项参考：
  - `GitHub Actions`
  - `GitLab CI`
  - `Jenkins`
  - `本地脚本为主`
  - `多套共存`
  - `暂未确定`

### `tooling_and_ai_pipeline`

- 触发：`tooling_and_ai_pipeline` 位于 `active_capabilities` 且进入 `unresolved_capabilities`
- 问题模板：`工具链 / MCP / AI pipeline 当前未确认，项目主要有哪些工程级工具能力？`
- 选项参考：
  - `MCP`
  - `Agent / AI pipeline`
  - `Editor / custom tools`
  - `自动化脚本`
  - `多套共存`
  - `暂未确定`

## 退出条件

- 当前主引擎的 `missing_directions` 与 `unresolved_directions` 都已检查
- `active_capabilities` 中的 `unresolved_capabilities` 都已检查
- 所有用户补充信息都已写回 `tech_stack_report`，并已完成 `status`、`variant`、`evidence`、`confirmed_by_user` 的归一化
- `confirmed_directions` / `confirmed_capabilities` 中的每一项都能被 Step 3 读取，不能只存在于临时集合
- 不对 `confirmed_*` 项重复提问
