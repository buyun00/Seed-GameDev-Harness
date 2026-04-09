---
name: fixed-questions-engine-unity-physics-navigation-or-runtime-framework
description: unity / 物理 / 导航 / Runtime Framework 固定问题模板
matrix_id: engine.unity.physics_navigation_or_runtime_framework
axis: engine
engine: unity
direction_id: physics_navigation_or_runtime_framework
owner: researcher-unity
question_set_id: qs-unity-physics-navigation-or-runtime-framework
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.unity.physics_navigation_or_runtime_framework 的固定问题模板。
- 补充该引擎物理、导航或 runtime framework 方向上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 taxonomy-registry.md 和实际检测结果决定。

## 固定问题

- id: unity_physics_navigation_or_runtime_framework_q1
  question: 项目的主物理方案是什么，使用 3D Physics、2D Physics、CharacterController 还是自定义运动框架？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - ProjectSettings/
    keywords:
      - Rigidbody
      - Rigidbody2D
      - Collider
      - Collider2D
      - CharacterController
      - PhysicsScene
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_physics_navigation_or_runtime_framework_q2
  question: 角色移动或核心物体运动的真实入口在哪里，是通过 Rigidbody、CharacterController、Transform 还是自定义 Motor 驱动？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - Move
      - SimpleMove
      - AddForce
      - velocity
      - CharacterMotor
      - controller
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_physics_navigation_or_runtime_framework_q3
  question: 碰撞层、LayerMask、物理材质和全局 Physics 设置是在什么地方定义和消费的？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - ProjectSettings/
      - Assets/
      - Packages/
    keywords:
      - LayerMask
      - PhysicsMaterial
      - Physics2DSettings
      - PhysicsManager
      - IgnoreLayerCollision
      - ContactFilter2D
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_physics_navigation_or_runtime_framework_q4
  question: OnCollision、OnTrigger、Raycast、Overlap 或查询式物理调用是如何和玩法逻辑联动的？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - OnCollisionEnter
      - OnTriggerEnter
      - Raycast
      - OverlapSphere
      - SphereCast
      - hit
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_physics_navigation_or_runtime_framework_q5
  question: 项目是否使用 NavMesh、NavMeshAgent、NavMeshSurface 或 AI Navigation 包，导航入口在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - NavMeshAgent
      - NavMeshSurface
      - AI Navigation
      - SetDestination
      - NavMeshPath
      - OffMeshLink
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_physics_navigation_or_runtime_framework_q6
  question: 导航网格是否在运行时生成、烘焙或动态更新，障碍物和 OffMeshLink 的处理代码在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Assets/Scenes/
    keywords:
      - BuildNavMesh
      - UpdateNavMesh
      - NavMeshObstacle
      - OffMeshLink
      - bake
      - collect sources
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_physics_navigation_or_runtime_framework_q7
  question: 物理与逻辑帧同步策略是什么，关键逻辑跑在 FixedUpdate、Update 还是自定义 PlayerLoop / Tick 框架里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - ProjectSettings/
    keywords:
      - FixedUpdate
      - Update
      - LateUpdate
      - fixedDeltaTime
      - PlayerLoop
      - Tick
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_physics_navigation_or_runtime_framework_q8
  question: 子弹、碰撞体、导航体或临时物理对象是否走对象池 / 复用框架，入口在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - Pool
      - ObjectPool
      - bullet
      - Spawn
      - Despawn
      - reuse
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_physics_navigation_or_runtime_framework_q9
  question: 除物理和导航外，项目是否还接入了 ECS / DOTS、KCC、行为树或其他运行时框架来承载战斗和 AI？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - Entities
      - BurstCompile
      - KCC
      - BehaviorTree
      - AI
      - RuntimeFramework
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_physics_navigation_or_runtime_framework_q10
  question: 物理和导航问题的调试、可视化和调参入口在哪里，例如 Gizmos、Debug.Draw、Profiler 或自定义面板？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Assets/Editor/
    keywords:
      - Debug.DrawRay
      - OnDrawGizmos
      - Gizmos
      - Profiler
      - debug path
      - visualize
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

