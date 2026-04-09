---
name: fixed-questions-engine-unity-native-code-architecture
description: unity / 原生代码架构 固定问题模板
matrix_id: engine.unity.native_code_architecture
axis: engine
engine: unity
direction_id: native_code_architecture
owner: researcher-unity
question_set_id: qs-unity-native-code-architecture
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.unity.native_code_architecture 的固定问题模板。
- 补充该引擎在原生代码架构、模式、异步和分层上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 taxonomy-registry.md 和实际检测结果决定。

## 固定问题

- id: unity_native_code_architecture_q1
  question: 项目的核心运行时分层是什么，是否存在 Framework / Core / Runtime / Game / Feature 这样的主架构边界？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - Framework
      - Core
      - Runtime
      - Game
      - Feature
      - Architecture
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_native_code_architecture_q2
  question: 代码是否通过 asmdef、Package、模块目录或命名空间显式划分编译边界？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - "*.asmdef"
    keywords:
      - asmdef
      - Assembly Definition
      - references
      - autoReferenced
      - namespace
      - package
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_native_code_architecture_q3
  question: 项目的启动装配过程在哪里，谁负责创建全局 Service、Manager、System 或 Controller？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - Bootstrap
      - Installer
      - Manager
      - Service
      - System
      - Controller
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_native_code_architecture_q4
  question: 项目的异步模型是什么，主要依赖 Coroutine、Task、Awaitable、UniTask 还是自定义调度器？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - StartCoroutine
      - async
      - await
      - Awaitable
      - UniTask
      - TaskCompletionSource
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_native_code_architecture_q5
  question: 依赖管理方式是什么，使用单例、Service Locator、DI 容器还是手动装配？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - Singleton
      - ServiceLocator
      - Inject
      - Container
      - Zenject
      - VContainer
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_native_code_architecture_q6
  question: 配置数据、运行时状态和资源引用是如何分层的，是否大量使用 ScriptableObject、配置类或纯 C# Model？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - ScriptableObject
      - Config
      - Model
      - Settings
      - SerializeField
      - data
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_native_code_architecture_q7
  question: 性能敏感模块是否使用 Jobs、Burst、Entities / DOTS 或自定义 Native 容器，边界代码在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - IJob
      - BurstCompile
      - Entities
      - SystemBase
      - NativeArray
      - DOTS
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_native_code_architecture_q8
  question: 运行时对象池、缓存层或复用框架是否独立成模块，核心入口在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - ObjectPool
      - Pool
      - Cache
      - Recycle
      - Spawn
      - Despawn
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_native_code_architecture_q9
  question: 本地存档、运行时序列化和持久化模块在哪里，使用的是 Json、二进制、PlayerPrefs 还是自定义格式？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - JsonUtility
      - Newtonsoft
      - BinaryFormatter
      - PlayerPrefs
      - Save
      - Serialize
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_native_code_architecture_q10
  question: Editor 工具代码、Runtime 代码、测试代码和生成代码之间是否有清晰边界，相关目录和程序集如何隔离？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Assets/Editor/
      - Assets/Tests/
    keywords:
      - Editor
      - Runtime
      - Tests
      - Generated
      - asmdef
      - testables
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

