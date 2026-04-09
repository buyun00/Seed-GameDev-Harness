---
name: embed-researcher-unity
description: /seed:embed Unity researcher 扫描剧本
triggers:
  - embed unity researcher
  - unity scan
  - unity matrix scan
domain:
  - project-analysis
scope:
  - agent-inject
---

## 加载顺序

创建 `researcher-unity` 前，必须先加载：

1. `seed/skills/embed/researcher-common.md`
2. `seed/skills/embed/researcher-runtime-common.md`
3. `seed/skills/embed/taxonomy-registry.md`
4. `seed/skills/embed/researcher-unity.md`

## TaskCreate 模板

```text
Task Kind: investigate
Expected Owner Role: researcher
Deliverable: Unity 引擎主线调查报告（SendMessage 给 leader 与 builder-unity）
Done Definition: 报告按 researcher-common 的三段格式输出；所有结论附证据路径；仅覆盖 Unity 主线方向；如运行时必查项缺失，则按 researcher-runtime-common 输出必查项缺失错误
Dependencies: none
Risk Level: low
Leader Ack Required: false
Original User Intent: 分析项目 Unity 主线方向，为生成 v2 矩阵 skill 提供依据
Scope Coverage: project_structure, scene_graph_and_lifecycle, native_code_architecture, script_layer, bridge_layer, ui_system, hot_reload, asset_pipeline, event_and_message_system, animation_system, physics_navigation_or_runtime_framework, plugin_extension, platform_adaptation
Exclusions: common-lua-embedding、common-data-config-pipeline、common-network-protocol-and-sync、common-build-release-and-cicd、common-tooling-and-ai-pipeline
```

## 扫描剧本

### 项目结构 / 场景生命周期 / 原生代码架构

- 搜索 `Assets/` 一级目录、`Packages/manifest.json`、`*.asmdef`
- 搜索 `*.unity`、`SceneManager`、`: MonoBehaviour`、`Awake(`、`Start(`、`OnEnable(`
- 搜索 `Manager`、`Service`、`System`、`Controller`、`Facade`、`async`、`await`、`UniTask`
- 只有同时命中目录职责和实际实现入口，才能写成主线约定

### 脚本层 / 桥接层

- 搜索 `*.lua`、脚本入口、脚本加载器、表驱动脚本目录
- 搜索 `LuaEnv`、`DoString`、`CSharpCallLua`、`LuaCallCSharp`、`DllImport`、原生 SDK wrapper
- Unity 侧只写宿主入口和桥接边界；Lua-specific 绑定、热修、Lua 约定要交给 `researcher-lua`
- 如果命中 Lua bridge，报告中要明确写“已命中 Lua 能力证据，供 builder-lua 消费”

### UI / 热更新 / 资源管线

- 搜索 `UnityEngine.UI`、`using FairyGUI;`、`UnityEngine.UIElements`、`.uxml`、`.uss`
- 搜索 `HybridCLR`、`ILRuntime`、`[Hotfix]`、patch loader、热更发布脚本
- 搜索 `AddressableAssetsData/`、`BuildAssetBundles`、loader/provider、加载释放调用点
- 资源加载与释放既是 Unity 主线方向，也是运行时必查项，必须继续追到项目封装

### 事件 / 动画 / 物理导航 / 插件 / 平台适配

- 搜索 `EventBus`、`Signal`、`Message`、`Dispatch`、`Broadcast`
- 搜索 `Animator`、`Timeline`、`PlayableDirector`、`Spine`、`DragonBones`
- 搜索 `Rigidbody`、`Collider`、`NavMesh`、`CharacterController`、runtime framework
- 搜索 `Plugins/`、`Packages/`、Editor extension、SDK wrapper
- 搜索 `#if UNITY_`、构建 target、小游戏平台目录、Android/iOS SDK

## 输出要求

- 运行时五问必须先回答，再写 Unity 主线方向发现
- 只写 Unity 主线，不把 Lua / 配置 / 网络 / CI/CD 结论吞进 Unity skill
- 如果某方向只命中依赖或目录，没有实际入口，要明确写 `unknown`
