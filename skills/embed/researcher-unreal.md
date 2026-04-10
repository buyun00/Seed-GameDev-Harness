---
name: embed-researcher-unreal
description: /seed:embed Unreal researcher 扫描剧本
triggers:
  - embed unreal researcher
  - unreal scan
  - unreal matrix scan
domain:
  - project-analysis
scope:
  - agent-inject
---

## 加载顺序

创建 `researcher-unreal` 前，必须先加载：

1. `$CLAUDE_PLUGIN_ROOT/skills/embed/researcher-common.md`
2. `$CLAUDE_PLUGIN_ROOT/skills/embed/researcher-runtime-common.md`
3. `$CLAUDE_PLUGIN_ROOT/skills/embed/taxonomy-registry.md`
4. `$CLAUDE_PLUGIN_ROOT/skills/embed/researcher-unreal.md`

## TaskCreate 模板

```text
Task Kind: investigate
Expected Owner Role: researcher
Deliverable: Unreal 引擎主线调查报告；写入 `.seed/state/embed/<embed_stamp>/reports/researcher-unreal.yaml`（原子写）；写完后 SendMessage 通知 leader 路径 + 状态摘要
Done Definition: 报告按 researcher-common 的四段格式输出；所有结论和 fixed_question_results 都附证据路径；仅覆盖 Unreal 主线方向；如运行时必查项缺失，则按 researcher-runtime-common 输出必查项缺失错误
Dependencies: none
Risk Level: low
Leader Ack Required: false
Original User Intent: 分析项目 Unreal 主线方向，为生成 v2 矩阵 skill 提供依据
Scope Coverage: project_structure, scene_graph_and_lifecycle, native_code_architecture, script_layer, bridge_layer, ui_system, hot_reload, asset_pipeline, event_and_message_system, animation_system, physics_navigation_or_runtime_framework, plugin_extension, platform_adaptation
Exclusions: common-lua-embedding、common-data-config-pipeline、common-network-protocol-and-sync、common-build-release-and-cicd、common-tooling-and-ai-pipeline
```

## 扫描剧本

### 项目结构 / 关卡生命周期 / 原生架构

- 搜索 `*.uproject`、`Source/`、`Content/`、`Config/`、`Plugins/`
- 搜索 `BeginPlay`、`GameMode`、`GameState`、`PlayerController`、`WorldSubsystem`
- 搜索 `Subsystem`、`ActorComponent`、模块规则、Gameplay Framework

### 脚本层 / 桥接层 / UI

- 搜索 Blueprint 资产组织、蓝图基类命名、Blueprint 函数库
- 搜索 `BlueprintCallable`、`BlueprintImplementableEvent`、plugin bridge、C++/Blueprint 边界
- 搜索 `Widget`、`UMG`、`Slate`、`CommonUI`
- 如果命中 UnLua，只写 Unreal 宿主桥接和入口证据，并把 Lua-specific 细节交给 `researcher-lua`

### 热重载 / 资产 / 事件 / 动画 / 物理导航 / 插件 / 平台

- 搜索 `Live Coding`、Hot Reload、插件热更脚本
- 搜索 `PrimaryAsset`、`StreamableManager`、`AssetManager`
- 搜索 delegates、message subsystem、GAS、replication event
- 搜索 `AnimBlueprint`、`Montage`、`Sequencer`
- 搜索 `CharacterMovement`、`NavigationSystem`、`Replication`、Chaos
- 搜索 `.uplugin`、平台模块、`Target.cs`

## 输出要求

- 如果蓝图资产只能确认存在，无法读到内部逻辑，必须明确写“资产存在，但内部实现不可读”
- 只写 Unreal 主线，不把 UnLua、网络、CI/CD 吞到 Unreal 专属 skill 里
