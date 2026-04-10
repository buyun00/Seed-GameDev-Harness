---
name: fixed-questions-composite-unreal-asset-pipeline-data-config-pipeline
description: unreal / asset-pipeline x data-config-pipeline 交叉固定问题模板
composite_id: composite.unreal.asset_pipeline.data_config_pipeline
axis: composite
engine: unreal
direction_id: asset_pipeline
capability: data_config_pipeline
capability_id: data_config_pipeline
owner: builder-engine
researcher_owner: researcher-unreal
capability_owner: researcher-config
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.unreal.asset_pipeline.data_config_pipeline` 的交叉固定问题模板。
- 只补充 `engine.unreal.asset_pipeline` 与 `capability.data_config_pipeline` 同时成立时新增的固定问题。
- 不重复 `fixed-questions/engine/unreal/asset-pipeline.md` 与 `fixed-questions/capability/data-config-pipeline.md` 已覆盖的基础问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。

## 固定问题

- id: unreal_asset_pipeline_data_config_pipeline_q1
  question: 项目中的配置型数据主要落在 `PrimaryDataAsset`、`DataAsset`、`DataTable`、`CurveTable` 或 Blueprint Data-Only Asset 的哪几类资源里？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - "Content/Data/"
      - "Content/Config/"
      - "Content/**/DA_*"
      - "Content/**/DT_*"
      - "Source/**/*Data*"
    keywords:
      - "UPrimaryDataAsset"
      - "UDataAsset"
      - "UDataTable"
      - "CurveTable"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_asset_pipeline_data_config_pipeline_q2
  question: 这些配置资源是否被注册为 `Primary Asset` 并纳入 `AssetManager` 扫描，以便统一发现、异步加载和 cook 管理？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/DefaultEngine.ini"
      - "Source/**/*AssetManager*"
      - "Source/**/*Data*"
      - "Content/"
    keywords:
      - "PrimaryAssetTypesToScan"
      - "PrimaryAssetId"
      - "AssetManager"
      - "PrimaryDataAsset"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_asset_pipeline_data_config_pipeline_q3
  question: 表驱动配置的数据源格式是什么，是否存在 `CSV/JSON -> UDataTable` 的导入、重导入或生成脚本？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Content/"
      - "Data/"
      - "Tools/"
      - "Scripts/"
      - "Source/**/*Factory*"
    keywords:
      - "CSV"
      - "JSON"
      - "Reimport"
      - "AssetImportTask"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_asset_pipeline_data_config_pipeline_q4
  question: 配置资源之间是否主要通过软引用组织依赖，避免把大型美术资源硬引用进常驻包或错误 chunk？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
      - "Content/**/DA_*"
      - "Content/**/DT_*"
    keywords:
      - "TSoftObjectPtr"
      - "TSoftClassPtr"
      - "SoftObjectPath"
      - "LoadSynchronous"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_asset_pipeline_data_config_pipeline_q5
  question: 配置资源是否带有 `AssetRegistrySearchable`、标签或自定义 metadata，用于检索、审计或运行时筛选？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.h"
      - "Source/**/*.cpp"
      - "Content/**/DA_*"
      - "Content/**/DT_*"
    keywords:
      - "AssetRegistrySearchable"
      - "Meta ="
      - "GameplayTag"
      - "PrimaryAssetType"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_asset_pipeline_data_config_pipeline_q6
  question: 重要配置资源是否通过 `PrimaryAssetLabel`、bundle 或 chunk 规则分配到独立包，以支持分包、预下载或按需加载？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/"
      - "Content/"
      - "Content/**/PrimaryAssetLabel*"
      - "Source/**/*AssetManager*"
    keywords:
      - "PrimaryAssetLabel"
      - "AssetBundles"
      - "ChunkId"
      - "CookRule"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_asset_pipeline_data_config_pipeline_q7
  question: 数据结构升级时，是否有 row struct 兼容、字段迁移、重定向或自动修复流程？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Data*"
      - "Source/**/*Struct*"
      - "Config/"
      - "Scripts/"
    keywords:
      - "Redirect"
      - "Version"
      - "Upgrade"
      - "Fixup"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_asset_pipeline_data_config_pipeline_q8
  question: 运行时读取配置时，是直接加载资产、先查 `AssetRegistry`，还是通过自定义数据注册表建立索引？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Registry*"
      - "Source/**/*Data*"
      - "Source/**/*Manager*"
      - "Source/**/*AssetManager*"
    keywords:
      - "AssetRegistry"
      - "GetPrimaryAssetId"
      - "FindRow"
      - "Registry"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_asset_pipeline_data_config_pipeline_q9
  question: 是否存在 `ini` 配置与 `DataAsset/DataTable` 双轨并存的方案，二者的覆盖顺序和职责边界是什么？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/"
      - "Source/**/*Config*"
      - "Source/**/*Settings*"
      - "Source/**/*Data*"
    keywords:
      - "Config="
      - "DefaultGame.ini"
      - "UDeveloperSettings"
      - "DataTable"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_asset_pipeline_data_config_pipeline_q10
  question: 项目是否对配置资产做统一验证，例如非法枚举值、缺失行、重复主键、软引用失效或循环依赖？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Validate*"
      - "Source/**/*Data*"
      - "Plugins/**/*Validate*"
      - "Scripts/"
      - "Tools/"
    keywords:
      - "IsDataValid"
      - "Validate"
      - "Duplicate"
      - "Missing"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
