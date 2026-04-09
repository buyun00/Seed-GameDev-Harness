---
name: fixed-questions-engine-unreal-physics-navigation-or-runtime-framework
description: unreal / 物理 / 导航 / Runtime Framework 固定问题模板
matrix_id: engine.unreal.physics_navigation_or_runtime_framework
axis: engine
engine: unreal
direction_id: physics_navigation_or_runtime_framework
owner: researcher-unreal
question_set_id: qs-unreal-physics-navigation-or-runtime-framework
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.unreal.physics_navigation_or_runtime_framework 的固定问题模板。
- 补充该引擎物理、导航或 runtime framework 方向上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 	axonomy-registry.md 和实际检测结果决定。

## 固定问题

- id: unreal_physics_navigation_or_runtime_framework_q1
  question: 角色或主要实体的移动框架是 `CharacterMovementComponent`、自定义 MovementComponent，还是完全自研运行时框架？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "UCharacterMovementComponent"
      - "UPawnMovementComponent"
      - "MovementComponent"
      - "SetMovementMode"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_physics_navigation_or_runtime_framework_q2
  question: 导航是否依赖 `NavigationSystem`、`NavMesh`、`AI MoveTo` 或自定义寻路系统？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/*.ini"
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "NavigationSystem"
      - "NavMesh"
      - "MoveTo"
      - "UNavigationSystemV1"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_physics_navigation_or_runtime_framework_q3
  question: 物理主栈是否基于 `Chaos`，碰撞、刚体或破坏效果的核心实现在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/*.ini"
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "Chaos"
      - "UPrimitiveComponent"
      - "SetSimulatePhysics"
      - "OnComponentHit"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_physics_navigation_or_runtime_framework_q4
  question: 移动与物理是否显式接入网络复制、预测或平滑同步，相关入口在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "SetIsReplicatedByDefault"
      - "GetLifetimeReplicatedProps"
      - "OnRep_"
      - "ClientPredictionData"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_physics_navigation_or_runtime_framework_q5
  question: 碰撞通道、对象类型和 Profile 是否在 `DefaultEngine.ini` 或代码中做了项目级定制？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/DefaultEngine.ini"
      - "Source/**/*.cpp"
      - "Source/**/*.h"
    keywords:
      - "CollisionProfile"
      - "ECC_GameTraceChannel"
      - "ObjectType"
      - "CollisionEnabled"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_physics_navigation_or_runtime_framework_q6
  question: AI、导航和行为决策是否通过 `AIController`、Behavior Tree、StateTree 或自定义 runtime framework 驱动？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
      - "Content/"
    keywords:
      - "AAIController"
      - "BehaviorTree"
      - "StateTree"
      - "MoveToActor"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_physics_navigation_or_runtime_framework_q7
  question: 核心 runtime framework 是否接入 `Gameplay Ability System`、Gameplay Tags 或自定义状态/技能框架？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "*.uproject"
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "AbilitySystemComponent"
      - "GameplayAbility"
      - "GameplayTag"
      - "AttributeSet"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_physics_navigation_or_runtime_framework_q8
  question: 是否存在自定义移动模式、物理子步进、载具或复杂角色运动扩展？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "CustomMovementMode"
      - "Substepping"
      - "Vehicle"
      - "PhysCustom"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_physics_navigation_or_runtime_framework_q9
  question: 运行时更新调度是否依赖 `Tick`、`TimerManager`、Subsystem 或其他统一调度器，而不是零散分布？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.cpp"
      - "Source/**/*.h"
    keywords:
      - "PrimaryComponentTick"
      - "Tick("
      - "FTimerManager"
      - "Subsystem"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_physics_navigation_or_runtime_framework_q10
  question: 是否存在 `Mass`、自定义 ECS、群体模拟、破坏系统或其他非标准 runtime framework 扩展？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "*.uproject"
      - "Source/**/*.Build.cs"
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "MassEntity"
      - "Mass"
      - "ECS"
      - "GeometryCollection"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
