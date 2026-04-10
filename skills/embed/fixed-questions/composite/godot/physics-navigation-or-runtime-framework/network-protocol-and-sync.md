---
name: fixed-questions-composite-godot-physics-navigation-or-runtime-framework-network-protocol-and-sync
description: godot / physics-navigation-or-runtime-framework x network-protocol-and-sync 交叉固定问题模板
composite_id: composite.godot.physics_navigation_or_runtime_framework.network_protocol_and_sync
axis: composite
engine: godot
direction_id: physics_navigation_or_runtime_framework
capability: network_protocol_and_sync
capability_id: network_protocol_and_sync
owner: builder-engine
researcher_owner: researcher-godot
capability_owner: researcher-infra
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.godot.physics_navigation_or_runtime_framework.network_protocol_and_sync` 的交叉固定问题模板。
- 这里只补 `engine.godot.physics_navigation_or_runtime_framework` 与 `capability.network_protocol_and_sync` 叠加后新增的必查问题。
- 不重复 `fixed-questions/engine/godot/physics-navigation-or-runtime-framework.md` 和 `fixed-questions/capability/network-protocol-and-sync.md` 已覆盖的基础问题。
- 每条问题都单独给出 `search_hints.paths` 与 `search_hints.keywords`，目录 hint 已下沉到问题级别。

## 固定问题

- id: godot_physics_navigation_or_runtime_framework_network_protocol_and_sync_q1
  question: 角色、投射物、物理体和导航代理的网络 authority 是如何划分的，哪些对象由服务端权威驱动，哪些对象允许客户端本地预测？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - characters/
      - actors/
      - physics/
      - navigation/
      - multiplayer/
      - "*.gd"
    keywords:
      - authority
      - set_multiplayer_authority
      - server
      - client
      - prediction
      - peer
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_physics_navigation_or_runtime_framework_network_protocol_and_sync_q2
  question: 移动或物理同步是通过 `MultiplayerSynchronizer` 同步属性、手写 RPC 快照、输入指令回放，还是运行时框架自己的 replication 层完成的？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - physics/
      - multiplayer/
      - network/
      - characters/
      - "*.gd"
      - "*.tscn"
    keywords:
      - MultiplayerSynchronizer
      - rpc
      - snapshot
      - input
      - replication
      - sync
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_physics_navigation_or_runtime_framework_network_protocol_and_sync_q3
  question: 网络同步节拍是否明确绑定在 `_physics_process()` 和固定 physics tick 上，还是混用了 `_process()`、Tween、Animation 或导航 idle 更新？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - physics/
      - navigation/
      - characters/
      - systems/
      - "*.gd"
      - "*.tscn"
    keywords:
      - _physics_process
      - _process
      - tick
      - Tween
      - AnimationPlayer
      - NavigationAgent
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_physics_navigation_or_runtime_framework_network_protocol_and_sync_q4
  question: 远端对象的平滑显示是依赖 Godot 物理插值、项目自定义插值或外推，还是回滚纠正机制，相关逻辑写在什么层？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - physics/
      - multiplayer/
      - characters/
      - systems/
      - "*.gd"
      - debug/
    keywords:
      - interpolation
      - extrapolation
      - smooth
      - rollback
      - correction
      - lerp
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_physics_navigation_or_runtime_framework_network_protocol_and_sync_q5
  question: 收到状态纠正、瞬移、重生或强制校正时，是否会调用 `reset_physics_interpolation()` 或等价逻辑避免插值拖尾和抖动？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - physics/
      - characters/
      - multiplayer/
      - "*.gd"
      - "*.cs"
      - debug/
    keywords:
      - reset_physics_interpolation
      - teleport
      - respawn
      - correction
      - interpolation
      - snap
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_physics_navigation_or_runtime_framework_network_protocol_and_sync_q6
  question: `CharacterBody`、`RigidBody`、`Area` 等不同运行时对象是否使用不同的同步策略，例如输入同步、状态同步或碰撞结果同步？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - physics/
      - characters/
      - projectiles/
      - actors/
      - "*.gd"
      - "*.tscn"
    keywords:
      - CharacterBody
      - RigidBody
      - Area
      - sync
      - collision
      - input
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_physics_navigation_or_runtime_framework_network_protocol_and_sync_q7
  question: 导航系统是同步完整路径、同步目标点或导航请求，还是只在权威端做寻路并把结果转成移动状态广播给其他 peer？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - navigation/
      - ai/
      - characters/
      - multiplayer/
      - "*.gd"
      - systems/
    keywords:
      - NavigationAgent
      - target_position
      - path
      - nav
      - authority
      - sync
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_physics_navigation_or_runtime_framework_network_protocol_and_sync_q8
  question: `MultiplayerSpawner` 的出生点、`root_path` 和运行时框架中的实体生命周期是否一一对应，死亡、销毁或回收时会不会产生重复生成或僵尸节点？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - multiplayer/
      - spawn/
      - characters/
      - systems/
      - "*.gd"
      - "*.tscn"
    keywords:
      - MultiplayerSpawner
      - root_path
      - spawn
      - despawn
      - free
      - recycle
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_physics_navigation_or_runtime_framework_network_protocol_and_sync_q9
  question: 由于 `MultiplayerSynchronizer` 不能直接同步 `Object` 或 `Resource` 类型属性，项目把运动状态、碰撞层、导航目标和运行时状态压成了哪些基础字段？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - multiplayer/
      - physics/
      - navigation/
      - "*.gd"
      - "*.tscn"
      - resources/
    keywords:
      - MultiplayerSynchronizer
      - property
      - state
      - resource
      - object
      - packed
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_physics_navigation_or_runtime_framework_network_protocol_and_sync_q10
  question: 调试网络与物理耦合问题时，是否有专门的可视化、日志或开发开关观察 authority、tick、预测误差、路径重算和同步回包？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - debug/
      - tools/
      - physics/
      - multiplayer/
      - "*.gd"
      - "*.tscn"
    keywords:
      - debug
      - authority
      - tick
      - prediction
      - path
      - overlay
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
