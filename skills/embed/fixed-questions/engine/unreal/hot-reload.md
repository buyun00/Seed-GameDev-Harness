---
name: fixed-questions-engine-unreal-hot-reload
description: unreal / 热更新 / 热重载 固定问题模板
matrix_id: engine.unreal.hot_reload
axis: engine
engine: unreal
direction_id: hot_reload
owner: researcher-unreal
question_set_id: qs-unreal-hot-reload
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.unreal.hot_reload 的固定问题模板。
- 补充该引擎热更新、热重载和快速迭代方向上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 `taxonomy-registry.md` 和实际检测结果决定。

## 固定问题

- id: unreal_hot_reload_q1
  question: 项目开发流程是否明确依赖 `Live Coding`，证据来自配置、脚本还是团队文档？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/*.ini"
      - "Source/**/*.cpp"
      - "Source/**/*.h"
      - "*.md"
    keywords:
      - "Live Coding"
      - "Enable Live Coding"
      - "Ctrl+Alt+F11"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_hot_reload_q2
  question: 项目是否仍显式使用或规避旧的 `Hot Reload` 流程，相关说明或脚本在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "*.md"
      - "Source/**/*.cpp"
      - "Source/**/*.h"
      - "Config/*.ini"
    keywords:
      - "Hot Reload"
      - "Recompile"
      - "Compile"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_hot_reload_q3
  question: 为了快速迭代，项目主要使用哪些 Editor 构建目标和配置，比如 `Development Editor`、`DebugGame Editor`？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.Target.cs"
      - "*.sln"
      - "*.md"
    keywords:
      - "TargetType.Editor"
      - "Development Editor"
      - "DebugGame Editor"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_hot_reload_q4
  question: 插件或模块是否支持动态重载，是否实现了 `SupportsDynamicReloading`、模块卸载或重新注册逻辑？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.cpp"
      - "Source/**/*.h"
      - "Plugins/**/*.cpp"
      - "Plugins/**/*.h"
    keywords:
      - "SupportsDynamicReloading"
      - "ShutdownModule"
      - "StartupModule"
      - "FModuleManager"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_hot_reload_q5
  question: Blueprint、Widget 或 Animation Blueprint 在代码变更后如何重新编译与实例重建，是否有显式处理流程？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.cpp"
      - "Plugins/**/*.cpp"
      - "*.md"
    keywords:
      - "Reinstance"
      - "CompileBlueprint"
      - "WidgetBlueprint"
      - "AnimBlueprint"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_hot_reload_q6
  question: 代码热编译后是否需要额外刷新配置、重新扫描资源或手动重建缓存？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.cpp"
      - "Source/**/*.h"
      - "*.md"
    keywords:
      - "ReloadConfig"
      - "ScanPathsSynchronous"
      - "Refresh"
      - "Rescan"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_hot_reload_q7
  question: 项目是否记录了“哪些改动不能依赖热重载，必须重启编辑器或全量重编”的边界？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "*.md"
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "restart editor"
      - "full rebuild"
      - "UCLASS"
      - "UPROPERTY"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_hot_reload_q8
  question: 开发工具链里是否有专门的批处理、PowerShell、命令行或 IDE 任务来加速热编译 / 重建流程？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "*.bat"
      - "*.ps1"
      - ".vscode/tasks.json"
      - "*.md"
    keywords:
      - "UnrealBuildTool"
      - "Build.bat"
      - "RunUAT"
      - "Editor"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_hot_reload_q9
  question: 模块重载后是否有显式的注册/反注册补偿逻辑，例如重新注册 Slate 样式、消息、反射或委托？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.cpp"
      - "Plugins/**/*.cpp"
    keywords:
      - "Register"
      - "Unregister"
      - "SlateStyle"
      - "DelegateHandle"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_hot_reload_q10
  question: 当 `Live Coding / Hot Reload` 失败时，团队的 fallback 流程是什么，是否有统一的全量重编或重启编辑器方案？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "*.md"
      - "*.bat"
      - "*.ps1"
      - "Source/**/*.Target.cs"
    keywords:
      - "rebuild"
      - "clean"
      - "restart"
      - "Development Editor"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
