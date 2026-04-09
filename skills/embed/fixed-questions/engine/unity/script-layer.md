---
name: fixed-questions-engine-unity-script-layer
description: unity / 脚本层 固定问题模板
matrix_id: engine.unity.script_layer
axis: engine
engine: unity
direction_id: script_layer
owner: researcher-unity
question_set_id: qs-unity-script-layer
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.unity.script_layer 的固定问题模板。
- 补充该引擎在脚本层组织、职责边界和宿主关系上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 taxonomy-registry.md 和实际检测结果决定。

## 固定问题

- id: unity_script_layer_q1
  question: 项目的主脚本宿主是什么，核心逻辑主要写在 MonoBehaviour、ScriptableObject、纯 C# 类还是混合模式里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - ": MonoBehaviour"
      - ScriptableObject
      - partial class
      - class
      - behaviour
      - runtime
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_script_layer_q2
  question: 脚本初始化顺序是如何控制的，是否依赖 Script Execution Order、RuntimeInitializeOnLoadMethod 或启动管理器？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - ProjectSettings/
    keywords:
      - RuntimeInitializeOnLoadMethod
      - DefaultExecutionOrder
      - execution order
      - Awake
      - OnEnable
      - bootstrap
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_script_layer_q3
  question: 脚本层的异步与时序逻辑主要写在 Coroutine、async / await、UniTask 还是自定义流程节点中？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - StartCoroutine
      - IEnumerator
      - async
      - await
      - UniTask
      - Awaitable
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_script_layer_q4
  question: 脚本配置和序列化字段如何组织，哪些配置通过 SerializeField、ScriptableObject 或配置表注入？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - SerializeField
      - ScriptableObject
      - TextAsset
      - Config
      - JsonUtility
      - data
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_script_layer_q5
  question: 核心脚本实例是如何创建的，是通过场景绑定、Prefab 挂载、AddComponent，还是运行时 new 出纯逻辑对象？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - AddComponent
      - Instantiate
      - new
      - GetComponent
      - prefab
      - component
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_script_layer_q6
  question: 脚本层是否有明确的 Presenter / View / Controller / Model 分层，还是全部揉在 MonoBehaviour 里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - Presenter
      - View
      - Controller
      - Model
      - MVVM
      - MVP
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_script_layer_q7
  question: 场景对象脚本和纯逻辑 Service / System / Manager 的职责边界在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - Manager
      - Service
      - System
      - Controller
      - MonoBehaviour
      - logic
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_script_layer_q8
  question: 脚本层是否使用生成代码、partial class、绑定代码或自动注入来减少手写胶水代码？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Tools/
    keywords:
      - Generated
      - AutoBind
      - partial
      - codegen
      - inject
      - bind
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_script_layer_q9
  question: 脚本层里的事件订阅、协程、异步任务和资源句柄在销毁时如何清理？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - OnDestroy
      - OnDisable
      - StopCoroutine
      - Cancel
      - Dispose
      - Release
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_script_layer_q10
  question: 如果项目还接入了 Lua / JS / 热更 DLL 等额外脚本运行时，Unity C# 脚本层负责的宿主边界在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Assets/Plugins/
    keywords:
      - LuaEnv
      - ILRuntime
      - HybridCLR
      - hotfix
      - bridge
      - host
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

