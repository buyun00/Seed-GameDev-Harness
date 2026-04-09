---
name: fixed-questions-engine-unreal-native-code-architecture
description: unreal / 原生代码架构 固定问题模板
matrix_id: engine.unreal.native_code_architecture
axis: engine
engine: unreal
direction_id: native_code_architecture
owner: researcher-unreal
question_set_id: qs-unreal-native-code-architecture
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.unreal.native_code_architecture 的固定问题模板。
- 补充该引擎在原生代码架构、模式、异步和分层上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 `taxonomy-registry.md` 和实际检测结果决定。

## 固定问题

- id: unreal_native_code_architecture_q1
  question: C++ 主体玩法代码分布在哪些模块、目录和命名空间中，核心职责是如何划分的？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/*/"
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "Public"
      - "Private"
      - "API"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_native_code_architecture_q2
  question: 项目是否以 `Gameplay Framework` 为主骨架，关键玩法分别挂在哪些 `GameMode / GameState / PlayerState / Controller / Pawn / Component` 上？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "AGameModeBase"
      - "AGameStateBase"
      - "APlayerController"
      - "UActorComponent"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_native_code_architecture_q3
  question: 是否存在 `Subsystem` 层作为服务容器或全局系统入口，分别使用了哪些 Subsystem 类型？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "UGameInstanceSubsystem"
      - "UWorldSubsystem"
      - "UEngineSubsystem"
      - "ULocalPlayerSubsystem"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_native_code_architecture_q4
  question: 是否使用 `ActorComponent`、`UObject` 服务对象、接口或组合模式来拆分玩法，而不是把逻辑全部堆在 Actor 上？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "UActorComponent"
      - "UINTERFACE"
      - "TScriptInterface"
      - "CreateDefaultSubobject"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_native_code_architecture_q5
  question: 跨模块 API 边界是否清晰，公共头、私有头和导出宏是如何组织的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/Public/"
      - "Source/**/Private/"
      - "Source/**/*.Build.cs"
    keywords:
      - "PublicDependencyModuleNames"
      - "PrivateDependencyModuleNames"
      - "_API"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_native_code_architecture_q6
  question: 是否存在统一的 Manager / Service / Facade 层，负责把复杂系统聚合成稳定入口？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Manager*"
      - "Source/**/*Service*"
      - "Source/**/*Facade*"
    keywords:
      - "Manager"
      - "Service"
      - "Facade"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_native_code_architecture_q7
  question: 异步任务、定时器和后台工作是通过 `Async`、`UE::Tasks`、`FTimerManager` 还是 `Latent` 机制组织的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.cpp"
      - "Source/**/*.h"
    keywords:
      - "Async("
      - "UE::Tasks"
      - "FTimerManager"
      - "FLatentActionInfo"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_native_code_architecture_q8
  question: 数据驱动层主要依赖 `DataAsset`、`DataTable`、配置类还是普通 C++ 结构体，领域数据和运行时状态如何分层？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
      - "Config/*.ini"
    keywords:
      - "UPrimaryDataAsset"
      - "UDataAsset"
      - "UDataTable"
      - "UDeveloperSettings"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_native_code_architecture_q9
  question: 是否接入了 `Gameplay Ability System`、自定义 ability framework 或其他 runtime framework 作为核心玩法架构？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
      - "*.uproject"
    keywords:
      - "GameplayAbility"
      - "AbilitySystemComponent"
      - "GameplayEffect"
      - "GameplayTag"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_native_code_architecture_q10
  question: 编辑器专用代码、命令行工具和运行时代码是否明确分离，避免核心玩法依赖 `UnrealEd` 或编辑器模块？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.Build.cs"
      - "Source/**/*.cpp"
      - "Plugins/**/*.Build.cs"
    keywords:
      - "UnrealEd"
      - "WITH_EDITOR"
      - "WITH_EDITORONLY_DATA"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
