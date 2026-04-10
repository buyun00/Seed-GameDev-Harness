---
name: fixed-questions-composite-cocos-physics-navigation-or-runtime-framework-network-protocol-and-sync
description: cocos / physics-navigation-or-runtime-framework x network-protocol-and-sync 交叉固定问题模板
composite_id: composite.cocos.physics_navigation_or_runtime_framework.network_protocol_and_sync
axis: composite
engine: cocos
direction_id: physics_navigation_or_runtime_framework
capability: network_protocol_and_sync
capability_id: network_protocol_and_sync
owner: builder-engine
researcher_owner: researcher-cocos
capability_owner: researcher-infra
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.cocos.physics_navigation_or_runtime_framework.network_protocol_and_sync` 的交叉固定问题模板。
- 只补充 `engine.cocos.physics_navigation_or_runtime_framework` 与 `capability.network_protocol_and_sync` 同时成立时新增的固定问题。
- 不重复 `fixed-questions/engine/cocos/physics-navigation-or-runtime-framework.md` 和 `fixed-questions/capability/network-protocol-and-sync.md` 已覆盖的基础问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 当前先留空模板，后续按实际项目与复用频次补充问题。

## 固定问题

- id: cocos_physics_navigation_or_runtime_framework_network_protocol_and_sync_q1
  question: 联机同步的主对象到底是输入、角色状态、物理状态、导航路径还是命中结果，主同步模型定义在哪个战斗或运行时框架模块里？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - assets/battle/
      - assets/framework/
      - assets/net/
      - assets/proto/
      - assets/config/
    keywords:
      - frame sync
      - snapshot
      - state
      - input
      - battle
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_physics_navigation_or_runtime_framework_network_protocol_and_sync_q2
  question: 网络同步节奏与 Cocos 物理 `fixedTimeStep`、逻辑帧和表现帧之间如何对齐，时钟基准和推进入口由谁控制？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/physics/
      - assets/framework/
      - assets/battle/
      - assets/net/
      - settings/
    keywords:
      - fixedTimeStep
      - tick
      - frame
      - sync
      - scheduler
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_physics_navigation_or_runtime_framework_network_protocol_and_sync_q3
  question: 项目使用引擎物理时，哪些状态会直接参与同步，例如位置、速度、碰撞事件、刚体状态；哪些状态只在本地推导不上传？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/physics/
      - assets/battle/
      - assets/net/
      - assets/proto/
      - assets/framework/
    keywords:
      - RigidBody
      - velocity
      - collision
      - sync
      - state
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_physics_navigation_or_runtime_framework_network_protocol_and_sync_q4
  question: 如果项目没有依赖引擎原生物理而是自研 runtime framework，网络层与该框架的状态快照、重演和回滚接口定义在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/framework/
      - assets/battle/
      - assets/net/
      - assets/proto/
      - assets/runtime/
    keywords:
      - rollback
      - replay
      - snapshot
      - runtime
      - simulation
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_physics_navigation_or_runtime_framework_network_protocol_and_sync_q5
  question: 碰撞分组、mask、阵营、技能命中层或导航区域编号，是否和协议层共享同一套枚举或配置，映射关系在哪里维护？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/config/
      - assets/physics/
      - assets/navigation/
      - assets/proto/
      - assets/battle/
    keywords:
      - group
      - mask
      - enum
      - layer
      - config
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_physics_navigation_or_runtime_framework_network_protocol_and_sync_q6
  question: 客户端预测、服务端校正、回滚重算或插值补偿是否存在；如果存在，是在物理/导航层内部做，还是在网络同步层外包一层？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/battle/
      - assets/framework/
      - assets/net/
      - assets/physics/
      - assets/navigation/
    keywords:
      - predict
      - reconcile
      - rollback
      - interpolate
      - correction
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_physics_navigation_or_runtime_framework_network_protocol_and_sync_q7
  question: 碰撞命中、寻路结果、阻挡变化等高频事件，是直接转成网络消息广播，还是只同步关键状态再由各端重建事件？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/physics/
      - assets/navigation/
      - assets/net/
      - assets/proto/
      - assets/battle/
    keywords:
      - hit
      - pathfinding
      - broadcast
      - event
      - state sync
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_physics_navigation_or_runtime_framework_network_protocol_and_sync_q8
  question: 物理回调或导航状态变化进入网络同步前，是否会先进入帧队列、战斗队列或消息缓冲区，以保证帧内顺序稳定？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/framework/
      - assets/battle/
      - assets/net/
      - assets/physics/
      - assets/navigation/
    keywords:
      - queue
      - buffer
      - order
      - callback
      - frame
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_physics_navigation_or_runtime_framework_network_protocol_and_sync_q9
  question: 断线重连、观战、回放或状态重建时，物理/导航/runtime framework 的初始快照是如何恢复的，恢复入口位于哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/battle/
      - assets/framework/
      - assets/net/
      - assets/proto/
      - assets/navigation/
    keywords:
      - reconnect
      - replay
      - snapshot
      - restore
      - spectator
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_physics_navigation_or_runtime_framework_network_protocol_and_sync_q10
  question: 是否存在专门用于排查“物理结果不同步”或“导航状态漂移”的调试工具，例如帧日志、状态快照、碰撞可视化或同步差异比对？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/framework/
      - assets/physics/
      - assets/navigation/
      - tools/
      - extensions/
    keywords:
      - debug
      - snapshot
      - trace
      - physics debug
      - diff
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
