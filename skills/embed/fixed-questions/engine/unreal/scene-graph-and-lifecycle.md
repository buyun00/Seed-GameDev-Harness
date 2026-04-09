---
name: fixed-questions-engine-unreal-scene-graph-and-lifecycle
description: unreal / 场景图与生命周期 固定问题模板
matrix_id: engine.unreal.scene_graph_and_lifecycle
axis: engine
engine: unreal
direction_id: scene_graph_and_lifecycle
owner: researcher-unreal
question_set_id: qs-unreal-scene-graph-and-lifecycle
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.unreal.scene_graph_and_lifecycle 的固定问题模板。
- 补充该引擎在场景/节点/对象图与生命周期主路径上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 `taxonomy-registry.md` 和实际检测结果决定。

## 固定问题

- id: unreal_scene_graph_and_lifecycle_q1
  question: 运行时主入口由哪些 Gameplay Framework 对象驱动，`GameInstance / GameMode / GameState / PlayerController / Pawn` 的实际实现类在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/DefaultGame.ini"
      - "Config/DefaultEngine.ini"
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "GameInstanceClass"
      - "GlobalDefaultGameMode"
      - "PlayerControllerClass"
      - "DefaultPawnClass"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_scene_graph_and_lifecycle_q2
  question: 默认启动地图、关卡切换和 travel 入口在哪里，项目是如何组织 `Level` 生命周期的？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/DefaultEngine.ini"
      - "Source/**/*.cpp"
      - "Source/**/*.h"
      - "Content/Maps/"
    keywords:
      - "GameDefaultMap"
      - "ServerDefaultMap"
      - "OpenLevel"
      - "ServerTravel"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_scene_graph_and_lifecycle_q3
  question: Actor / Component 的核心生命周期入口是否集中在 `BeginPlay`、`EndPlay`、`Tick`、`OnRegister` 或 `InitializeComponent`？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.cpp"
      - "Source/**/*.h"
    keywords:
      - "BeginPlay("
      - "EndPlay("
      - "Tick("
      - "InitializeComponent"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_scene_graph_and_lifecycle_q4
  question: 是否存在 `UGameInstanceSubsystem`、`UWorldSubsystem`、`UEngineSubsystem` 或 `ULocalPlayerSubsystem` 这类跨场景生命周期入口？
  must_find: false
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

- id: unreal_scene_graph_and_lifecycle_q5
  question: 地图加载是否使用 `Level Streaming`、`World Partition` 或自定义场景流转管理器？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/*.ini"
      - "Source/**/*.cpp"
      - "Source/**/*.h"
      - "Content/Maps/"
    keywords:
      - "LoadStreamLevel"
      - "ULevelStreaming"
      - "WorldPartition"
      - "SeamlessTravel"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_scene_graph_and_lifecycle_q6
  question: 玩家生成、占有和重生流程是否通过 `Possess`、`RestartPlayer`、`SpawnDefaultPawnFor` 等标准链路实现？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.cpp"
      - "Source/**/*.h"
    keywords:
      - "Possess("
      - "RestartPlayer"
      - "SpawnDefaultPawnFor"
      - "OnPossess"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_scene_graph_and_lifecycle_q7
  question: 运行时全局状态是主要挂在 `GameState / PlayerState`，还是挂在各类 Subsystem / Manager 上？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "AGameStateBase"
      - "APlayerState"
      - "Subsystem"
      - "Manager"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_scene_graph_and_lifecycle_q8
  question: 是否存在自定义的世界初始化、关卡前后钩子或模块启动逻辑，比如在模块启动时注册世界事件？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.cpp"
      - "Plugins/**/*.cpp"
    keywords:
      - "StartupModule"
      - "OnWorldBeginPlay"
      - "FWorldDelegates"
      - "PostLoadMapWithWorld"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_scene_graph_and_lifecycle_q9
  question: 是否大量依赖关卡蓝图、`WorldSettings` 或 `AHUD` 作为生命周期编排入口？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Content/Maps/"
      - "Content/**/BP_*"
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "AHUD"
      - "WorldSettings"
      - "LevelScriptActor"
      - "ReceiveBeginPlay"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_scene_graph_and_lifecycle_q10
  question: Server / Client 生命周期是否有显式分流，哪些类只在服务器存在，哪些在客户端本地驱动？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.cpp"
      - "Source/**/*.h"
    keywords:
      - "HasAuthority()"
      - "GetLocalRole()"
      - "NM_Client"
      - "AGameModeBase"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
