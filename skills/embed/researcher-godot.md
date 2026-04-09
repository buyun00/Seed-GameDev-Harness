---
name: embed-researcher-godot
description: /seed:embed Godot researcher 扫描剧本
triggers:
  - embed godot researcher
  - godot scan
  - godot matrix scan
domain:
  - project-analysis
scope:
  - agent-inject
---

## 加载顺序

创建 `researcher-godot` 前，必须先加载：

1. `$CLAUDE_PLUGIN_ROOT/skills/embed/researcher-common.md`
2. `$CLAUDE_PLUGIN_ROOT/skills/embed/researcher-runtime-common.md`
3. `$CLAUDE_PLUGIN_ROOT/skills/embed/taxonomy-registry.md`
4. `$CLAUDE_PLUGIN_ROOT/skills/embed/researcher-godot.md`

## TaskCreate 模板

```text
Task Kind: investigate
Expected Owner Role: researcher
Deliverable: Godot 引擎主线调查报告（SendMessage 给 leader 与 builder-godot）
Done Definition: 报告按 researcher-common 的三段格式输出；仅覆盖 Godot 主线方向；如运行时必查项缺失，则按 researcher-runtime-common 输出必查项缺失错误
Dependencies: none
Risk Level: low
Leader Ack Required: false
Original User Intent: 分析项目 Godot 主线方向，为生成 v2 矩阵 skill 提供依据
Scope Coverage: project_structure, scene_graph_and_lifecycle, native_code_architecture, script_layer, bridge_layer, ui_system, hot_reload, asset_pipeline, event_and_message_system, animation_system, physics_navigation_or_runtime_framework, plugin_extension, platform_adaptation
Exclusions: common-lua-embedding、common-data-config-pipeline、common-network-protocol-and-sync、common-build-release-and-cicd、common-tooling-and-ai-pipeline
```

## 扫描剧本

### 项目结构 / 场景生命周期 / 原生架构

- 搜索 `project.godot`、`addons/`、`autoload`、`*.tscn`、`*.gd`、`*.cs`
- 搜索 `_ready()`、`_process()`、`_physics_process()`、scene inheritance、autoload 单例
- 搜索 `class_name`、基础脚本、`.csproj`、服务脚本、异步调用

### 脚本层 / 桥接层 / UI

- 搜索 GDScript 主脚本层、GDScript 与 C# 混用入口
- 搜索 `GDExtension`、`GDNative`、addon/plugin bridge、native binding
- 搜索 `Control`、`Theme`、UI scene、`CanvasLayer`、自定义控件
- 如果命中 Lua 插件或 GDLua，只写 Godot 宿主桥接证据，并标注交给 `researcher-lua`

### 热重载 / 资源 / 事件 / 动画 / 物理 / 插件 / 平台

- 搜索 addon/plugin hot reload、自定义 reload 逻辑
- 搜索 `load(`、`preload(`、`ResourceLoader`、`PackedScene`
- 搜索 `signal`、`connect(`、`Callable`
- 搜索 `AnimationPlayer`、`AnimationTree`、`Tween`
- 搜索 `CharacterBody`、`RigidBody`、`NavigationServer`
- 搜索 `addons/`、editor plugin、`export_presets.cfg`

## 输出要求

- 如果只有默认 GDScript reload、没有项目级热更方案，可将 `hot_reload` 写为 `unsupported`
- 只写 Godot 主线，不把 GDLua、网络、CI/CD 吞到 Godot 专属 skill 里
