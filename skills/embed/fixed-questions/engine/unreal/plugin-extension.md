---
name: fixed-questions-engine-unreal-plugin-extension
description: unreal / 插件与扩展 固定问题模板
matrix_id: engine.unreal.plugin_extension
axis: engine
engine: unreal
direction_id: plugin_extension
owner: researcher-unreal
question_set_id: qs-unreal-plugin-extension
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.unreal.plugin_extension 的固定问题模板。
- 补充该引擎插件、扩展模块和外部接入方式上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 `taxonomy-registry.md` 和实际检测结果决定。

## 固定问题

- id: unreal_plugin_extension_q1
  question: 项目下是否存在本地 `Plugins/`，每个插件的 `.uplugin`、模块列表和职责边界在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Plugins/**/*.uplugin"
      - "*.uproject"
    keywords:
      - "\"Modules\""
      - "\"EnabledByDefault\""
      - "\"LoadingPhase\""
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_plugin_extension_q2
  question: 插件模块是否明确区分 `Runtime / Editor / Developer`，编辑器扩展和运行时代码有没有拆开？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Plugins/**/*.uplugin"
      - "Plugins/**/*.Build.cs"
    keywords:
      - "\"Type\": \"Runtime\""
      - "\"Type\": \"Editor\""
      - "UnrealEd"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_plugin_extension_q3
  question: 插件依赖和第三方库接入是否主要写在 `Build.cs` 中，哪些插件承担了 SDK 或底层能力封装？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Plugins/**/*.Build.cs"
      - "Plugins/**/Source/**/ThirdParty/"
    keywords:
      - "PublicDependencyModuleNames"
      - "PrivateDependencyModuleNames"
      - "PublicAdditionalLibraries"
      - "ThirdParty"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_plugin_extension_q4
  question: 插件的加载阶段和初始化入口是什么，是否依赖 `LoadingPhase`、`StartupModule`、`ShutdownModule` 控制生命周期？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Plugins/**/*.uplugin"
      - "Plugins/**/*.cpp"
      - "Plugins/**/*.h"
    keywords:
      - "\"LoadingPhase\""
      - "StartupModule"
      - "ShutdownModule"
      - "IModuleInterface"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_plugin_extension_q5
  question: 是否存在编辑器工具、资产菜单、Details 定制或自定义面板，说明插件承担编辑器扩展职责？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Plugins/**/*.cpp"
      - "Plugins/**/*.h"
    keywords:
      - "IDetailCustomization"
      - "RegisterNomadTabSpawner"
      - "AssetTools"
      - "ToolMenus"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_plugin_extension_q6
  question: 插件能力是否向项目暴露了 Blueprint API、Subsystem 或公共 C++ facade，扩展边界如何对外开放？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Plugins/**/*.h"
      - "Plugins/**/*.cpp"
    keywords:
      - "BlueprintCallable"
      - "Subsystem"
      - "UBlueprintFunctionLibrary"
      - "_API"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_plugin_extension_q7
  question: 项目是否依赖大量 Engine 插件，依赖开关是写在 `.uproject` 还是各插件之间互相依赖？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "*.uproject"
      - "Plugins/**/*.uplugin"
    keywords:
      - "\"Plugins\""
      - "\"Enabled\""
      - "\"Name\""
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_plugin_extension_q8
  question: 插件是否有自己的 `Config`、`DeveloperSettings` 或项目设置页面，说明它们是可配置扩展而不是纯代码库？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Plugins/**/Config/"
      - "Plugins/**/*.h"
      - "Plugins/**/*.cpp"
    keywords:
      - "DeveloperSettings"
      - "ISettingsModule"
      - "Config"
      - "Default"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_plugin_extension_q9
  question: 是否存在 `ModularFeatures`、服务注册表或接口工厂，支持插件级能力插拔而不是静态耦合？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Plugins/**/*.h"
      - "Plugins/**/*.cpp"
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "IModularFeatures"
      - "RegisterModularFeature"
      - "Factory"
      - "Provider"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_plugin_extension_q10
  question: 是否存在平台专属插件、可选业务插件或按目标平台启停的扩展模块？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Plugins/**/*.uplugin"
      - "Plugins/**/*.Build.cs"
      - "Source/**/*.Target.cs"
    keywords:
      - "WhitelistPlatforms"
      - "PlatformAllowList"
      - "Target.Platform"
      - "SupportedTargetPlatforms"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
