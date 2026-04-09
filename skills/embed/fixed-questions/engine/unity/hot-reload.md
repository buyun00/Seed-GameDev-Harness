---
name: fixed-questions-engine-unity-hot-reload
description: unity / 热更新 固定问题模板
matrix_id: engine.unity.hot_reload
axis: engine
engine: unity
direction_id: hot_reload
owner: researcher-unity
question_set_id: qs-unity-hot-reload
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.unity.hot_reload 的固定问题模板。
- 补充该引擎热更新、代码补丁和运行时装载路径上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 taxonomy-registry.md 和实际检测结果决定。

## 固定问题

- id: unity_hot_reload_q1
  question: 项目是否真的实现了业务级热更新，使用的是 HybridCLR、ILRuntime、xLua Hotfix，还是仅依赖 Unity 的域重载 / 脚本重编译？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - ProjectSettings/
      - Tools/
    keywords:
      - HybridCLR
      - ILRuntime
      - Hotfix
      - hotupdate
      - xLua
      - Domain Reload
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_hot_reload_q2
  question: 热更新系统的初始化入口在哪里，由哪个启动场景、Bootstrap、Manager 或更新模块负责启动？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Tools/
    keywords:
      - Initialize
      - Bootstrap
      - UpdateManager
      - HotfixManager
      - AppDomain
      - RuntimeApi
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_hot_reload_q3
  question: 热更载荷是什么，是 DLL、补丁包、Addressables 资源、AssetBundle 还是混合方案，下载和装载顺序在哪里定义？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Assets/StreamingAssets/
      - Assets/AddressableAssetsData/
    keywords:
      - dll
      - AssetBundle
      - Addressables
      - LoadFromFile
      - LoadAsset
      - LoadAssembly
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_hot_reload_q4
  question: 如果使用 HybridCLR 或 IL2CPP 热更，AOT 元数据补充、泛型补齐和依赖 DLL 加载顺序是如何处理的？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Tools/
    keywords:
      - LoadMetadataForAOTAssembly
      - AOT
      - metadata
      - supplementary metadata
      - dll list
      - dependency
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_hot_reload_q5
  question: 主包代码和热更代码的边界在哪里，哪些模块允许放进热更层，哪些必须留在宿主层？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - "*.asmdef"
    keywords:
      - HotUpdate
      - asmdef
      - main package
      - host
      - bridge
      - boundary
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_hot_reload_q6
  question: 热更层如何挂接 MonoBehaviour、委托、协程、跨域继承或适配器，这些绑定代码写在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Tools/
    keywords:
      - CrossBindingAdaptor
      - DelegateManager
      - CLRBinding
      - StartCoroutine
      - MonoBehaviourAdapter
      - adapter
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_hot_reload_q7
  question: 热更版本号、Manifest、校验信息、远端下载地址和灰度开关配置放在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Assets/StreamingAssets/
      - Packages/
      - Tools/
    keywords:
      - manifest
      - version
      - checksum
      - md5
      - cdn
      - remote url
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_hot_reload_q8
  question: 热更失败、版本回退、重试或禁用热更时的兜底逻辑写在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Tools/
    keywords:
      - rollback
      - fallback
      - retry
      - disable hotfix
      - error
      - downgrade
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_hot_reload_q9
  question: 如果项目没有业务级热更，那么是否修改了 Enter Play Mode、Domain Reload 或脚本重载配置来缩短迭代时间？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - ProjectSettings/
      - Assets/Editor/
      - Packages/
    keywords:
      - Enter Play Mode
      - Reload Domain
      - Reload Scene
      - Domain Reload
      - playModeOptions
      - EditorSettings
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_hot_reload_q10
  question: 热更相关的构建、裁剪、生成绑定、拷贝 DLL、发布补丁等脚本入口在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Editor/
      - Tools/
      - Packages/
    keywords:
      - GenerateAll
      - BuildPipeline
      - CopyDll
      - strip
      - GenerateCLRBinding
      - package patch
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

