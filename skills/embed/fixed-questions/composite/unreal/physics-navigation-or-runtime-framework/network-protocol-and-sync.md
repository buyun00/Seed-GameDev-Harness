---
name: fixed-questions-composite-unreal-physics-navigation-or-runtime-framework-network-protocol-and-sync
description: unreal / physics-navigation-or-runtime-framework x network-protocol-and-sync 交叉固定问题模板
composite_id: composite.unreal.physics_navigation_or_runtime_framework.network_protocol_and_sync
axis: composite
engine: unreal
direction_id: physics_navigation_or_runtime_framework
capability: network_protocol_and_sync
capability_id: network_protocol_and_sync
owner: builder-engine
researcher_owner: researcher-unreal
capability_owner: researcher-infra
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.unreal.physics_navigation_or_runtime_framework.network_protocol_and_sync` 的交叉固定问题模板。
- 只补充 `engine.unreal.physics_navigation_or_runtime_framework` 与 `capability.network_protocol_and_sync` 同时成立时新增的固定问题。
- 不重复 `fixed-questions/engine/unreal/physics-navigation-or-runtime-framework.md` 与 `fixed-questions/capability/network-protocol-and-sync.md` 已覆盖的基础问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。

## 固定问题

- id: unreal_physics_navigation_or_runtime_framework_network_protocol_and_sync_q1
  question: 项目的移动主框架是什么，使用 `CharacterMovementComponent`、`Mover`、Chaos Networked Physics 还是完全自研运行时框架？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - "Source/**/*Movement*"
      - "Source/**/*Physics*"
      - "Source/**/*Mover*"
      - "Plugins/**/*Movement*"
      - "Plugins/**/*Physics*"
    keywords:
      - "UCharacterMovementComponent"
      - "Mover"
      - "NetworkPhysics"
      - "Chaos"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_physics_navigation_or_runtime_framework_network_protocol_and_sync_q2
  question: 角色移动同步是否沿用 Unreal 标准 `server move + client adjust + smoothing` 路径，还是有自定义 packed move 或 prediction 扩展？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Movement*"
      - "Source/**/*Character*"
      - "Source/**/*.cpp"
      - "Source/**/*.h"
    keywords:
      - "CallServerMovePacked"
      - "ClientAdjustPosition"
      - "SmoothClientPosition"
      - "FSavedMove_Character"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_physics_navigation_or_runtime_framework_network_protocol_and_sync_q3
  question: 自定义移动模式、冲刺、滑墙、攀爬、飞行等特殊运动，是否接入了 Unreal 的网络保存与重放链路？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Movement*"
      - "Source/**/*Ability*"
      - "Source/**/*Character*"
      - "Source/**/*.cpp"
    keywords:
      - "CustomMovementMode"
      - "SavedMove"
      - "CompressedFlags"
      - "PredictionData"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_physics_navigation_or_runtime_framework_network_protocol_and_sync_q4
  question: Root Motion、Ability 驱动位移或程序化位移是否需要网络同步，它们是走 montage、root motion source 还是自定义协议？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Animation*"
      - "Source/**/*Ability*"
      - "Source/**/*Movement*"
      - "Content/**/ABP_*"
    keywords:
      - "RootMotion"
      - "RootMotionSource"
      - "Montage"
      - "GameplayAbility"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_physics_navigation_or_runtime_framework_network_protocol_and_sync_q5
  question: 物理驱动 Actor 是否启用了 `Replicate Movement`、Networked Physics、预测插值或 resimulation，相关设置写在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Physics*"
      - "Source/**/*Actor*"
      - "Source/**/*.cpp"
      - "Config/"
    keywords:
      - "Replicate Movement"
      - "NetworkPhysics"
      - "Resimulation"
      - "PredictiveInterpolation"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_physics_navigation_or_runtime_framework_network_protocol_and_sync_q6
  question: 对 `autonomous proxy`、`simulated proxy` 和 server authority 三类对象，物理同步策略是否不同，边界如何体现在代码里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Physics*"
      - "Source/**/*Movement*"
      - "Source/**/*.cpp"
      - "Source/**/*.h"
    keywords:
      - "ROLE_AutonomousProxy"
      - "ROLE_SimulatedProxy"
      - "HasAuthority"
      - "replicate_physics_to_autonomous_proxy"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_physics_navigation_or_runtime_framework_network_protocol_and_sync_q7
  question: 导航相关状态是否只在服务端寻路、客户端只接收结果，还是会同步路径点、MoveRequest 或 SmartObject 状态？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Nav*"
      - "Source/**/*Path*"
      - "Source/**/*AI*"
      - "Source/**/*SmartObject*"
    keywords:
      - "PathFollowingComponent"
      - "MoveTo"
      - "NavMesh"
      - "SmartObject"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_physics_navigation_or_runtime_framework_network_protocol_and_sync_q8
  question: 移动基座、传送、附着、载具或 moving platform 是否有单独的同步策略，避免位置抖动或校正爆炸？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Movement*"
      - "Source/**/*Vehicle*"
      - "Source/**/*Platform*"
      - "Source/**/*.cpp"
    keywords:
      - "ReplicatedBasedMovement"
      - "Teleport"
      - "AttachTo"
      - "BasedMovement"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_physics_navigation_or_runtime_framework_network_protocol_and_sync_q9
  question: 物理线程、固定步长、预测帧偏移和网络平滑模式等参数是否经过项目级配置，而不是完全沿用默认值？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/"
      - "Source/**/*Physics*"
      - "Source/**/*Movement*"
      - "Source/**/*.cpp"
    keywords:
      - "FixedTick"
      - "NetworkSmoothingMode"
      - "PhysicsThread"
      - "Prediction"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_physics_navigation_or_runtime_framework_network_protocol_and_sync_q10
  question: 运行时框架是否包含网络调试工具，用于观察 movement correction、physics resim、prediction miss、路径重算与同步延迟？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/"
      - "Source/**/*Debug*"
      - "Source/**/*Physics*"
      - "Source/**/*Movement*"
    keywords:
      - "p.net."
      - "np2."
      - "Correction"
      - "Resim"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
