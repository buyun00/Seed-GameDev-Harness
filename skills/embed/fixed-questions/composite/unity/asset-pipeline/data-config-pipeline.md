---
name: fixed-questions-composite-unity-asset-pipeline-data-config-pipeline
description: unity / asset-pipeline x data-config-pipeline 交叉固定问题模板
composite_id: composite.unity.asset_pipeline.data_config_pipeline
axis: composite
engine: unity
direction_id: asset_pipeline
capability: data_config_pipeline
capability_id: data_config_pipeline
owner: builder-engine
researcher_owner: researcher-unity
capability_owner: researcher-config
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.unity.asset_pipeline.data_config_pipeline` 的交叉固定问题模板。
- 这里只补 `engine.unity.asset_pipeline` 与 `capability.data_config_pipeline` 同时成立时新增的固定问题。
- 不重复 `fixed-questions/engine/unity/asset-pipeline.md` 和 `fixed-questions/capability/data-config-pipeline.md` 已覆盖的基础问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。

## 固定问题

- id: unity_asset_pipeline_data_config_pipeline_q1
  question: 配置源数据从表格、JSON、Proto 或其他格式导入 Unity 后，最终会生成什么资源形态参与打包，例如 ScriptableObject、TextAsset、bytes 或 AssetBundle 依赖？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Assets/Editor/
      - Tools/
      - Packages/
    keywords:
      - ScriptableObject
      - TextAsset
      - bytes
      - config
      - table
      - protobuf
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_asset_pipeline_data_config_pipeline_q2
  question: 配置导入、生成和转资产的 Editor 工具写在哪里，是 ScriptedImporter、AssetPostprocessor、菜单工具还是独立导表脚本？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Editor/
      - Tools/
      - Packages/
    keywords:
      - ScriptedImporter
      - AssetPostprocessor
      - MenuItem
      - CreateAsset
      - config generator
      - import
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_asset_pipeline_data_config_pipeline_q3
  question: 配置资产是否被放进独立的 Addressables Group、AssetBundle 或标签体系中，它们与普通美术资源的打包边界在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/AddressableAssetsData/
      - Assets/
      - Assets/Editor/
    keywords:
      - AddressableAssetGroup
      - label
      - config
      - AssetBundle
      - group
      - pack separately
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_asset_pipeline_data_config_pipeline_q4
  question: 配置资产在打包前是否执行 Schema 校验、主键唯一性校验、外键引用校验或枚举合法性校验，校验入口在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Editor/
      - Tools/
      - Packages/
    keywords:
      - validate
      - schema
      - duplicate id
      - foreign key
      - enum
      - check
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_asset_pipeline_data_config_pipeline_q5
  question: 如果配置需要区分客户端版本、渠道、语言或环境，打包阶段是如何切组、切目录、切标签或切 Catalog 的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/AddressableAssetsData/
      - Assets/
      - Tools/
    keywords:
      - label
      - locale
      - channel
      - environment
      - catalog
      - profile
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_asset_pipeline_data_config_pipeline_q6
  question: 运行时读取配置时用到的索引、键到路径映射或生成代码是在打包前生成的，还是运行时动态发现的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Assets/Editor/
      - Tools/
      - Packages/
    keywords:
      - index
      - map
      - generated
      - GUIDToAssetPath
      - config loader
      - lookup
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_asset_pipeline_data_config_pipeline_q7
  question: 配置是否支持远端更新，如果支持，配置资源与普通热更资源是共用下载链路还是单独维护版本和回退？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/AddressableAssetsData/
      - Assets/
      - Tools/
      - Assets/StreamingAssets/
    keywords:
      - config update
      - remote
      - catalog
      - manifest
      - rollback
      - version
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_asset_pipeline_data_config_pipeline_q8
  question: 多张配置表之间的引用关系是在导表阶段烘焙成 Unity 资产引用，还是在运行时通过 ID / Key 二次解析？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Assets/Editor/
      - Tools/
    keywords:
      - reference
      - id
      - key
      - AssetReference
      - ScriptableObject
      - resolve
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_asset_pipeline_data_config_pipeline_q9
  question: 当配置源文件变更时，哪些资产需要增量重建，脏数据检测和重导逻辑写在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Editor/
      - Tools/
      - Packages/
    keywords:
      - incremental
      - dirty
      - hash
      - reimport
      - changed files
      - cache
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_asset_pipeline_data_config_pipeline_q10
  question: 配置资产在进入包体前是否还会经历压缩、加密、二进制编码或拆分大表的处理，这些处理放在哪个阶段？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Editor/
      - Tools/
      - Assets/
      - Packages/
    keywords:
      - encrypt
      - compress
      - binary
      - split
      - bytes
      - serialize
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

  - `ScriptableObject`
  - `TextAsset`
  - `bytes`
  - `AddressableAssetGroup`
  - `config`
  - `table`
  - `validate`
  - `manifest`
