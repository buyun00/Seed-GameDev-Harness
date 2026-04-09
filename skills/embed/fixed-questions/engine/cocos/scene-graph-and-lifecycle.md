---
name: fixed-questions-engine-cocos-scene-graph-and-lifecycle
description: cocos / 场景图与生命周期 固定问题模板
matrix_id: engine.cocos.scene_graph_and_lifecycle
axis: engine
engine: cocos
direction_id: scene_graph_and_lifecycle
owner: researcher-cocos
question_set_id: qs-cocos-scene-graph-and-lifecycle
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.cocos.scene_graph_and_lifecycle 的固定问题模板。
- 补充该引擎在场景/节点/对象图与生命周期主路径上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 `taxonomy-registry.md` 和实际检测结果决定。

## 固定问题

- id: cocos_scene_graph_and_lifecycle_q1
  question: 项目实际通过哪些入口切场景，首场景和后续场景切换链路分别落在哪些脚本或管理器里？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - assets/
      - assets/scenes/
      - assets/scripts/
    keywords:
      - director.loadScene
      - preloadScene
      - runScene
      - Scene
      - sceneManager
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_scene_graph_and_lifecycle_q2
  question: 哪些节点或组件会跨场景常驻，是否使用了常驻根节点或全局单例对象？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/scripts/
    keywords:
      - addPersistRootNode
      - persist
      - DontDestroy
      - singleton
      - global
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_scene_graph_and_lifecycle_q3
  question: onLoad、onEnable、start、update、lateUpdate、onDisable、onDestroy 这些生命周期在项目里主要承担什么职责？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/scripts/
      - assets/src/
    keywords:
      - onLoad
      - onEnable
      - start
      - update
      - onDestroy
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_scene_graph_and_lifecycle_q4
  question: Prefab 的实例化、挂载、回收和销毁由谁负责，是否形成了统一的创建与释放约束？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/prefabs/
      - assets/ui/
      - assets/scripts/
    keywords:
      - instantiate
      - prefab
      - destroy
      - pool
      - NodePool
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_scene_graph_and_lifecycle_q5
  question: 组件执行顺序是否通过 executionOrder、依赖组件或初始化编排显式控制？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/scripts/
    keywords:
      - executionOrder
      - requireComponent
      - dependency
      - init
      - bootstrap
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_scene_graph_and_lifecycle_q6
  question: 输入事件、定时器、schedule 和异步回调在节点销毁时是否被可靠清理，避免悬挂引用或重复触发？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/scripts/
    keywords:
      - schedule
      - unschedule
      - off(
      - once(
      - onDestroy
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_scene_graph_and_lifecycle_q7
  question: 场景切换过程中，全局状态、玩家数据和 UI 状态是如何保留、迁移或重建的？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/scripts/
      - assets/ui/
    keywords:
      - state
      - cache
      - persist
      - restore
      - reload
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_scene_graph_and_lifecycle_q8
  question: 是否存在动态创建节点后再延迟绑定数据或事件的模式，这些异步初始化链路在哪里收口？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/scripts/
      - assets/ui/
    keywords:
      - instantiate
      - await
      - Promise
      - init
      - bind
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_scene_graph_and_lifecycle_q9
  question: 节点树中是否约定了特定根节点、层级容器或 UI Layer，业务代码是否依赖固定挂点名称？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/scenes/
      - assets/ui/
      - assets/prefabs/
    keywords:
      - Canvas
      - Layer
      - UIRoot
      - find(
      - getChildByName
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_scene_graph_and_lifecycle_q10
  question: 项目如何防止异步资源加载返回时节点已经销毁或场景已切换导致的空引用问题？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/
      - assets/scripts/
      - assets/ui/
    keywords:
      - isValid
      - node?.isValid
      - director.getScene
      - callback
      - release
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
