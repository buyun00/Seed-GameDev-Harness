---
name: embed-researcher-cocos
description: /seed:embed Cocos researcher 扫描剧本
triggers:
  - embed cocos researcher
  - cocos scan
  - cocos matrix scan
domain:
  - project-analysis
scope:
  - agent-inject
---

## 加载顺序

创建 `researcher-cocos` 前，必须先加载：

1. `seed/skills/embed/researcher-common.md`
2. `seed/skills/embed/researcher-runtime-common.md`
3. `seed/skills/embed/taxonomy-registry.md`
4. `seed/skills/embed/researcher-cocos.md`

## TaskCreate 模板

```text
Task Kind: investigate
Expected Owner Role: researcher
Deliverable: Cocos 引擎主线调查报告（SendMessage 给 leader 与 builder-cocos）
Done Definition: 报告按 researcher-common 的三段格式输出；仅覆盖 Cocos 主线方向；如运行时必查项缺失，则按 researcher-runtime-common 输出必查项缺失错误
Dependencies: none
Risk Level: low
Leader Ack Required: false
Original User Intent: 分析项目 Cocos 主线方向，为生成 v2 矩阵 skill 提供依据
Scope Coverage: project_structure, scene_graph_and_lifecycle, native_code_architecture, script_layer, bridge_layer, ui_system, hot_reload, asset_pipeline, event_and_message_system, animation_system, physics_navigation_or_runtime_framework, plugin_extension, platform_adaptation
Exclusions: common-lua-embedding、common-data-config-pipeline、common-network-protocol-and-sync、common-build-release-and-cicd、common-tooling-and-ai-pipeline
```

## 扫描剧本

### 项目结构 / 场景生命周期 / 原生架构

- 搜索 `assets/`、`settings/`、`extensions/`、`*.ts`、`*.js`
- 搜索 `*.scene`、`*.prefab`、`onLoad()`、`start()`、`update()`、`director.loadScene`
- 搜索 `@ccclass`、基础 `Component`、service/module、异步封装

### 脚本层 / 桥接层 / UI

- 搜索 TypeScript / JavaScript 主脚本层与入口
- 搜索 `jsb`、原生桥接、plugin bridge、SDK wrapper
- 搜索 `Button`、`Widget`、`Layout`、UI manager、自研 view/panel
- 如果命中 Lua 插件，只写 Cocos 宿主桥接证据，并把 Lua-specific 细节交给 `researcher-lua`

### 热更新 / 资源 / 事件 / 动画 / 物理 / 插件 / 平台

- 搜索 `hotupdate`、manifest、patch script、`jsb.AssetsManager`
- 搜索 `assetManager`、`resources.load`、bundle 加载、自研封装
- 搜索 `EventTarget`、消息中心、广播封装
- 搜索 `Tween`、`Animation`、`Spine`、`DragonBones`
- 搜索 Physics2D/3D、导航或 runtime systems
- 搜索 `extensions/`、原生扩展、微信小游戏、平台宏、构建脚本

## 输出要求

- 只写 Cocos 主线，不把跨引擎能力写进 Cocos 专属 skill
- 资源加载与释放必须追到项目封装或调用落点，不能只停在官方 API
