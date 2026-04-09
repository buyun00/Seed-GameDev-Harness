---
name: fixed-questions-engine-unity-asset-pipeline
description: unity / 资源管线 固定问题模板
matrix_id: engine.unity.asset_pipeline
axis: engine
engine: unity
direction_id: asset_pipeline
owner: researcher-unity
question_set_id: qs-unity-asset-pipeline
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.unity.asset_pipeline 的固定问题模板。
- 补充该引擎资源组织、加载、释放和打包主路径上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 taxonomy-registry.md 和实际检测结果决定。

## 固定问题

- id: unity_asset_pipeline_q1
  question: 项目的主资源加载路径是什么，使用的是 Addressables、AssetBundle、Resources，还是自定义 Loader / Provider？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Assets/AddressableAssetsData/
    keywords:
      - Addressables
      - AssetBundle
      - Resources.Load
      - LoadAssetAsync
      - AssetReference
      - AssetProvider
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_asset_pipeline_q2
  question: 资源分组、标签、Catalog、Build Profile 或打包脚本写在哪里，由谁触发构建？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/AddressableAssetsData/
      - Assets/Editor/
      - Packages/
      - ProjectSettings/
    keywords:
      - AddressableAssetSettings
      - AddressableAssetGroup
      - BuildPlayerContent
      - BuildScriptPackedMode
      - BuildPipeline.BuildAssetBundles
      - profile
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_asset_pipeline_q3
  question: 运行时负责加载资源的抽象层在哪里，是否存在统一的资源管理器、缓存层或异步封装？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - LoadAssetAsync
      - InstantiateAsync
      - ResourceManager
      - AssetLoader
      - AssetHandle
      - IResourceLocator
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_asset_pipeline_q4
  question: 资源释放策略是什么，是否实现了引用计数、句柄释放、缓存淘汰或 UnloadUnusedAssets 主路径？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - Release
      - ReleaseInstance
      - UnloadUnusedAssets
      - Dispose
      - refCount
      - cache
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_asset_pipeline_q5
  question: 项目是否实现了 ScriptedImporter、AssetPostprocessor 或自定义导入规则，这些导入扩展写在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Editor/
      - Packages/
    keywords:
      - ScriptedImporter
      - AssetPostprocessor
      - OnPostprocess
      - OnPreprocess
      - AssetImporter
      - AssetImportContext
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_asset_pipeline_q6
  question: 编辑器侧是否通过 AssetDatabase、菜单工具或批处理脚本生成资源索引、配置表或预处理产物？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Editor/
      - Packages/
      - Tools/
    keywords:
      - AssetDatabase
      - FindAssets
      - GUIDToAssetPath
      - MenuItem
      - BuildPipeline
      - Refresh
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_asset_pipeline_q7
  question: 项目是否使用 Resources、StreamingAssets 或原始文件目录承载配置、热更包或媒体资源，入口和访问方式在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Resources/
      - Assets/StreamingAssets/
      - Assets/
      - Packages/
    keywords:
      - Resources.Load
      - StreamingAssets
      - persistentDataPath
      - File.ReadAllBytes
      - UnityWebRequest
      - TextAsset
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_asset_pipeline_q8
  question: 场景、Prefab、材质、配置 ScriptableObject 等关键资产是如何被定位和动态加载的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
    keywords:
      - LoadSceneAsync
      - InstantiateAsync
      - AssetReferenceGameObject
      - AssetReferenceT
      - ScriptableObject
      - Prefab
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_asset_pipeline_q9
  question: 项目是否存在预加载、启动清单、依赖收集或首包资源初始化逻辑，这部分入口在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Assets/AddressableAssetsData/
    keywords:
      - Preload
      - InitializeAsync
      - catalog
      - DownloadDependenciesAsync
      - bootstrap
      - warmup
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_asset_pipeline_q10
  question: 远端资源更新、Catalog 切换、版本校验和失败回退的实现路径在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Assets/AddressableAssetsData/
    keywords:
      - CheckForCatalogUpdates
      - UpdateCatalogs
      - GetDownloadSizeAsync
      - Hash128
      - version
      - manifest
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

