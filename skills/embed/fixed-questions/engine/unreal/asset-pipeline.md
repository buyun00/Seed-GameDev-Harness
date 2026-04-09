---
name: fixed-questions-engine-unreal-asset-pipeline
description: unreal / 资源管线 固定问题模板
matrix_id: engine.unreal.asset_pipeline
axis: engine
engine: unreal
direction_id: asset_pipeline
owner: researcher-unreal
question_set_id: qs-unreal-asset-pipeline
scope:
  - agent-inject
---

## 填写说明

- 本文件是 engine.unreal.asset_pipeline 的固定问题模板。
- 补充该引擎资源组织、加载、释放和打包主路径上的固定问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 如该方向对当前引擎通常可能为 unsupported，也先保留模板；是否启用由 `taxonomy-registry.md` 和实际检测结果决定。

## 固定问题

- id: unreal_asset_pipeline_q1
  question: 项目是否启用了 `AssetManager` 作为统一资源管线入口，相关配置和自定义实现在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/DefaultEngine.ini"
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "AssetManagerClassName"
      - "UAssetManager"
      - "AssetManager"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_asset_pipeline_q2
  question: `Primary Asset` 类型、扫描目录和加载规则是如何定义的，是否在 ini 或自定义 `AssetManager` 中配置？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/DefaultEngine.ini"
      - "Source/**/*.h"
      - "Source/**/*.cpp"
      - "Content/"
    keywords:
      - "PrimaryAssetTypesToScan"
      - "PrimaryAssetId"
      - "PrimaryAssetType"
      - "PrimaryAssetLabel"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_asset_pipeline_q3
  question: 资源引用是否主要通过 `SoftObjectPtr / SoftClassPtr / StreamableManager` 进行异步加载，而不是到处硬引用？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
    keywords:
      - "TSoftObjectPtr"
      - "TSoftClassPtr"
      - "FStreamableManager"
      - "RequestAsyncLoad"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_asset_pipeline_q4
  question: 是否存在自定义资源加载器、预加载器或资源 facade，对 `AssetManager` / `StreamableManager` 做了二次封装？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Asset*"
      - "Source/**/*Loader*"
      - "Source/**/*Manager*"
    keywords:
      - "LoadPrimaryAsset"
      - "RequestAsyncLoad"
      - "Preload"
      - "Asset"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_asset_pipeline_q5
  question: DataAsset、DataTable、Curve、PrimaryDataAsset 等数据资源在项目中分别承担什么角色？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
      - "Content/**/DA_*"
    keywords:
      - "UPrimaryDataAsset"
      - "UDataAsset"
      - "UDataTable"
      - "CurveTable"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_asset_pipeline_q6
  question: 打包分块、Chunk、Asset Bundle 或 `PrimaryAssetLabel` 是否被用于控制资源归包和下载边界？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/DefaultGame.ini"
      - "Config/DefaultEngine.ini"
      - "Content/"
    keywords:
      - "PrimaryAssetLabel"
      - "ChunkId"
      - "AssetBundles"
      - "CookRule"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_asset_pipeline_q7
  question: `Content/` 是否有明确的资源命名和目录规范，能够区分地图、角色、UI、动画、特效与数据资源？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Content/"
      - "Content/Maps/"
      - "Content/UI/"
      - "Content/Characters/"
    keywords:
      - "Maps"
      - "UI"
      - "Characters"
      - "Data"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_asset_pipeline_q8
  question: Cooking、扫描目录、重定向和自动发现规则主要写在什么配置里，是否有自定义扫描白名单？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/DefaultEngine.ini"
      - "Config/DefaultGame.ini"
      - "Source/**/*.cpp"
    keywords:
      - "DirectoriesToAlwaysCook"
      - "PrimaryAssetTypesToScan"
      - "ScanPathsSynchronous"
      - "Redirector"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_asset_pipeline_q9
  question: 资源释放和生命周期是否有统一策略，例如句柄缓存、异步句柄管理、显式卸载或 GC 边界？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.cpp"
      - "Source/**/*.h"
    keywords:
      - "FStreamableHandle"
      - "UnloadPrimaryAsset"
      - "ReleaseHandle"
      - "CollectGarbage"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_asset_pipeline_q10
  question: 是否存在导入脚本、工厂类或编辑器扩展，说明项目对资源导入管线做了自动化或自定义扩展？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Factory*"
      - "Source/**/*Import*"
      - "Plugins/**/*Factory*"
      - "Plugins/**/*Import*"
    keywords:
      - "UFactory"
      - "AssetTools"
      - "Reimport"
      - "Automated"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
