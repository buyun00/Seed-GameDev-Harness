---
name: fixed-questions-engine-cocos-physics-navigation-or-runtime-framework
description: cocos / 物理 / 导航 / Runtime Framework 固定问题模板
matrix_id: engine.cocos.physics_navigation_or_runtime_framework
axis: engine
engine: cocos
direction_id: physics_navigation_or_runtime_framework
owner: researcher-cocos
question_set_id: qs-cocos-physics-navigation-or-runtime-framework
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.cocos.physics_navigation_or_runtime_framework 的固定问题模板。
- 补充该引擎物理、导航或 runtime framework 方向上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 `taxonomy-registry.md` 和实际检测结果决定。

## 固定问题

- id: cocos_physics_navigation_or_runtime_framework_q1
  question: 项目实际使用了 Cocos 2D 物理、3D 物理、导航系统还是自研 runtime framework，主入口在哪里？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - assets/
      - assets/scripts/
      - assets/scenes/
    keywords:
      - PhysicsSystem
      - PhysicsSystem2D
      - Collider
      - RigidBody
      - navigation
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_physics_navigation_or_runtime_framework_q2
  question: 碰撞体、刚体、触发器和碰撞回调是直接挂在组件上，还是经过统一玩法框架再次封装？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/scripts/
    keywords:
      - Collider2D
      - Collider
      - RigidBody2D
      - onBeginContact
      - onCollisionEnter
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_physics_navigation_or_runtime_framework_q3
  question: 物理层级、碰撞分组、mask 配置和命中筛选规则定义在哪里，是否有全局枚举？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - settings/
      - assets/config/
    keywords:
      - group
      - mask
      - layer
      - collision matrix
      - enum
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_physics_navigation_or_runtime_framework_q4
  question: 角色移动、寻路、导航网格或格子寻路是依赖引擎能力还是项目自研模块？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/navigation/
      - assets/scripts/
    keywords:
      - nav
      - pathfinding
      - grid
      - moveTo
      - AStar
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_physics_navigation_or_runtime_framework_q5
  question: 物理更新步长、帧同步节奏和逻辑帧与表现帧的关系在哪里控制？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/scripts/
      - settings/
    keywords:
      - fixedTimeStep
      - step
      - tick
      - frame
      - update
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_physics_navigation_or_runtime_framework_q6
  question: 对象池与物理组件复用时，速度、碰撞状态和监听器是否有统一 reset 逻辑？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/scripts/
      - assets/prefabs/
    keywords:
      - reset
      - pool
      - velocity
      - collider
      - rigidbody
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_physics_navigation_or_runtime_framework_q7
  question: 若项目没有使用引擎原生物理，替代的 runtime framework 是否定义了自己的更新循环、碰撞或战斗判定框架？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/framework/
      - assets/battle/
    keywords:
      - runtime
      - battle system
      - tick
      - simulation
      - hit test
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_physics_navigation_or_runtime_framework_q8
  question: 物理调试、碰撞可视化和导航调试工具是否落在编辑器扩展或运行时调试开关里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - extensions/
      - tools/
    keywords:
      - debug draw
      - gizmo
      - navigation debug
      - physics debug
      - draw
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_physics_navigation_or_runtime_framework_q9
  question: 物理结果、命中事件和导航状态如何同步到动画、UI 或战斗逻辑层？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/animation/
      - assets/ui/
    keywords:
      - hit
      - event
      - state
      - animation
      - notify
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_physics_navigation_or_runtime_framework_q10
  question: 是否存在平台差异或性能妥协，例如低端机关闭物理细节、改用近似判定或禁用导航？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - settings/
      - native/
    keywords:
      - low device
      - optimize
      - physics off
      - fallback
      - quality
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
