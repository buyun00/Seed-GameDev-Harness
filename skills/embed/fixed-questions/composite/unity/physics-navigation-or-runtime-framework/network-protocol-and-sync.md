---
name: fixed-questions-composite-unity-physics-navigation-or-runtime-framework-network-protocol-and-sync
description: unity / physics-navigation-or-runtime-framework x network-protocol-and-sync 交叉固定问题模板
composite_id: composite.unity.physics_navigation_or_runtime_framework.network_protocol_and_sync
axis: composite
engine: unity
direction_id: physics_navigation_or_runtime_framework
capability: network_protocol_and_sync
capability_id: network_protocol_and_sync
owner: builder-unity
researcher_owner: researcher-unity
capability_owner: researcher-infra
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.unity.physics_navigation_or_runtime_framework.network_protocol_and_sync` 的交叉固定问题模板。
- 这里只补 `engine.unity.physics_navigation_or_runtime_framework` 与 `capability.network_protocol_and_sync` 同时成立时新增的固定问题。
- 不重复 `fixed-questions/engine/unity/physics-navigation-or-runtime-framework.md` 和 `fixed-questions/capability/network-protocol-and-sync.md` 已覆盖的基础问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。

## 交叉固定问题

- id: unity_physics_navigation_or_runtime_framework_network_protocol_and_sync_q1
  question: 物理驱动对象、CharacterController 或自定义 Motor 的网络权威模型是什么，是服务器权威、Owner 权威还是客户端预测加服务器校正？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - ProjectSettings/
    keywords:
      - authority
      - owner
      - server authoritative
      - prediction
      - reconcile
      - CharacterController
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_physics_navigation_or_runtime_framework_network_protocol_and_sync_q2
  question: 可同步的运动状态到底包含哪些字段，例如位置、旋转、速度、输入、力、跳跃状态、NavMesh 目标点或 AI 状态？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - position
      - rotation
      - velocity
      - input
      - destination
      - state sync
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_physics_navigation_or_runtime_framework_network_protocol_and_sync_q3
  question: 运动同步是否依赖 NetworkTransform、NetworkRigidbody 等现成组件，还是项目自定义了快照、插值或压缩同步组件？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - NetworkTransform
      - NetworkRigidbody
      - snapshot
      - interpolation
      - compression
      - sync component
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_physics_navigation_or_runtime_framework_network_protocol_and_sync_q4
  question: Unity 的 FixedUpdate / fixedDeltaTime 与网络 TickRate 是如何对齐的，是否存在专门的帧桥接或重采样逻辑？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - ProjectSettings/
    keywords:
      - FixedUpdate
      - fixedDeltaTime
      - TickRate
      - NetworkTick
      - simulation
      - PlayerLoop
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_physics_navigation_or_runtime_framework_network_protocol_and_sync_q5
  question: 如果核心移动不是 Rigidbody 而是 CharacterController、KCC 或自定义 Motor，预测、回滚和重放逻辑放在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - CharacterController
      - KCC
      - Motor
      - rollback
      - prediction
      - replay
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_physics_navigation_or_runtime_framework_network_protocol_and_sync_q6
  question: NavMeshAgent、寻路请求或 AI Runtime Framework 是只在服务器侧模拟，还是客户端也会本地计算并做结果同步？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - NavMeshAgent
      - SetDestination
      - AI
      - server only
      - client simulate
      - path
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_physics_navigation_or_runtime_framework_network_protocol_and_sync_q7
  question: 子弹、投射物、碰撞盒、AOE 或临时导航体在联网下是否走对象池和网络对象复用，生成与回收如何同步？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - projectile
      - ObjectPool
      - spawn
      - despawn
      - hitbox
      - pool
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_physics_navigation_or_runtime_framework_network_protocol_and_sync_q8
  question: 碰撞、Trigger、命中检测和物理查询结果由哪一侧判定为权威，再通过什么协议同步给其他客户端？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - OnCollisionEnter
      - OnTriggerEnter
      - Raycast
      - authoritative
      - hit result
      - RPC
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_physics_navigation_or_runtime_framework_network_protocol_and_sync_q9
  question: 插值、外推、滞后补偿、回滚或状态压缩等同步策略分别落在哪些运动系统和网络组件上？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - interpolation
      - extrapolation
      - lag compensation
      - rollback
      - compression
      - snapshot
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_physics_navigation_or_runtime_framework_network_protocol_and_sync_q10
  question: 当场上存在大量动态体、AI 单位或运行时实体时，是否做了 Interest Management、可见性裁剪或同步调试可视化？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Assets/Editor/
      - Packages/
    keywords:
      - interest management
      - visibility
      - culling
      - debug draw
      - gizmos
      - network debug
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

## 交叉搜索提示

- paths:
  - `Assets/`
  - `Packages/`
  - `ProjectSettings/`
  - `Assets/Editor/`
- keywords:
  - `NetworkTransform`
  - `NetworkRigidbody`
  - `authority`
  - `prediction`
  - `reconcile`
  - `FixedUpdate`
  - `TickRate`
  - `NavMeshAgent`
  - `projectile`
  - `lag compensation`
