---
name: fixed-questions-engine-unity-scene-graph-and-lifecycle
description: unity / 场景图与生命周期 固定问题模板
matrix_id: engine.unity.scene_graph_and_lifecycle
axis: engine
engine: unity
direction_id: scene_graph_and_lifecycle
owner: researcher-unity
question_set_id: qs-unity-scene-graph-and-lifecycle
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.unity.scene_graph_and_lifecycle 的固定问题模板。
- 补充该引擎在场景/节点/对象图与生命周期主路径上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 taxonomy-registry.md 和实际检测结果决定。

## 固定问题

- id: unity_scene_graph_and_lifecycle_q1
  question: 项目的启动场景或启动对象是什么，第一段运行时代码从哪个 Scene、Prefab 或 Bootstrap 脚本开始？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - ProjectSettings/
    keywords:
      - Bootstrap
      - Entry
      - Build Settings
      - RuntimeInitializeOnLoadMethod
      - startup scene
      - preload
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_scene_graph_and_lifecycle_q2
  question: 场景切换由谁管理，使用 SceneManager.LoadScene、LoadSceneAsync、Addressables 场景还是自定义场景流转器？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - SceneManager.LoadScene
      - LoadSceneAsync
      - LoadSceneMode.Additive
      - UnloadSceneAsync
      - Addressables.LoadSceneAsync
      - scene flow
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_scene_graph_and_lifecycle_q3
  question: 全局常驻对象和跨场景管理器在哪里创建，是否使用 DontDestroyOnLoad 保持生命周期？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - DontDestroyOnLoad
      - singleton
      - persistent
      - manager
      - global root
      - bootstrap
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_scene_graph_and_lifecycle_q4
  question: 运行时对象主要如何生成，是场景内静态摆放、Prefab Instantiate、Addressables Instantiate 还是对象池复用？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - Instantiate
      - InstantiateAsync
      - Prefab
      - Addressables
      - Pool
      - Spawn
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_scene_graph_and_lifecycle_q5
  question: 项目是否显式依赖 Awake、OnEnable、Start、RuntimeInitializeOnLoadMethod 等生命周期顺序来完成初始化？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - Awake
      - OnEnable
      - Start
      - RuntimeInitializeOnLoadMethod
      - execution order
      - DefaultExecutionOrder
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_scene_graph_and_lifecycle_q6
  question: 场景加载完成、卸载和激活后的回调入口在哪里，是否监听了 sceneLoaded / sceneUnloaded / activeSceneChanged？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - sceneLoaded
      - sceneUnloaded
      - activeSceneChanged
      - OnSceneLoaded
      - OnSceneUnloaded
      - SceneManager
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_scene_graph_and_lifecycle_q7
  question: 异步场景加载、加载页、过场和激活时机控制是怎么组织的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - allowSceneActivation
      - AsyncOperation
      - loading
      - progress
      - transition
      - fade
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_scene_graph_and_lifecycle_q8
  question: 层级根节点、UI Root、World Root、Scene Root 等运行时节点树是如何组织和命名的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Assets/Scenes/
    keywords:
      - Root
      - UIRoot
      - WorldRoot
      - SceneRoot
      - transform.SetParent
      - hierarchy
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_scene_graph_and_lifecycle_q9
  question: 场景对象销毁、反注册和资源回收放在哪些生命周期回调里，是否有统一清理器或回收器？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - OnDisable
      - OnDestroy
      - Dispose
      - Release
      - Cleanup
      - teardown
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_scene_graph_and_lifecycle_q10
  question: 如果项目使用多场景编辑、Additive Scene、Prefab Stage 或关卡流式加载，主控制代码在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Assets/Scenes/
    keywords:
      - Additive
      - MultiScene
      - PrefabStage
      - LoadSceneMode.Additive
      - stream
      - level streaming
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

