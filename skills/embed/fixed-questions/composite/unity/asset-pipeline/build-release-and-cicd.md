---
name: fixed-questions-composite-unity-asset-pipeline-build-release-and-cicd
description: unity / asset-pipeline x build-release-and-cicd 交叉固定问题模板
composite_id: composite.unity.asset_pipeline.build_release_and_cicd
axis: composite
engine: unity
direction_id: asset_pipeline
capability: build_release_and_cicd
capability_id: build_release_and_cicd
owner: builder-engine
researcher_owner: researcher-unity
capability_owner: researcher-infra
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.unity.asset_pipeline.build_release_and_cicd` 的交叉固定问题模板。
- 这里只补 `engine.unity.asset_pipeline` 与 `capability.build_release_and_cicd` 同时成立时新增的固定问题。
- 不重复 `fixed-questions/engine/unity/asset-pipeline.md` 和 `fixed-questions/capability/build-release-and-cicd.md` 已覆盖的基础问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。

## 固定问题

- id: unity_asset_pipeline_build_release_and_cicd_q1
  question: 资源打包在 CI/CD 中由哪个 Unity Editor 脚本、命令行入口或流水线任务触发，它与 Player Build 的先后顺序是什么？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Editor/
      - Assets/AddressableAssetsData/
      - Tools/
      - ProjectSettings/
    keywords:
      - BuildPlayerContent
      - BuildPipeline.BuildPlayer
      - batchmode
      - executeMethod
      - CI
      - Jenkins
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_asset_pipeline_build_release_and_cicd_q2
  question: 流水线是否区分完整资源构建、内容更新构建和仅客户端构建三种模式，差异入口与条件写在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Editor/
      - Assets/AddressableAssetsData/
      - Tools/
    keywords:
      - ContentUpdateScript
      - content_state.bin
      - update a previous build
      - full build
      - Addressables
      - build mode
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_asset_pipeline_build_release_and_cicd_q3
  question: 不同环境或渠道的资源构建配置放在哪里，例如 Build Profile、Addressables Profile、打包路径和远端加载路径是如何注入的？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/AddressableAssetsData/
      - ProjectSettings/
      - Tools/
      - Assets/Editor/
    keywords:
      - profile
      - BuildProfile
      - RemoteLoadPath
      - RemoteBuildPath
      - PlayerSettings
      - scripting define symbols
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_asset_pipeline_build_release_and_cicd_q4
  question: 资源版本号、Catalog Hash、Bundle 命名规则和客户端版本号或 Git Commit 的关联关系在哪里定义？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/AddressableAssetsData/
      - Tools/
      - Assets/Editor/
      - ProjectSettings/
    keywords:
      - catalog
      - hash
      - version
      - bundle naming
      - commit
      - manifest
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_asset_pipeline_build_release_and_cicd_q5
  question: 无头构建时是否会强制执行资源导入、平台切换、压缩格式或贴图设置，以保证本地与 CI 产物一致？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Editor/
      - Tools/
      - ProjectSettings/
    keywords:
      - SwitchActiveBuildTarget
      - TextureImporter
      - AssetDatabase.Refresh
      - reimport
      - compression
      - import settings
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_asset_pipeline_build_release_and_cicd_q6
  question: 资源构建完成后是否生成 Manifest、下载清单、校验和、体积报表或依赖分析报告，这些产物输出到哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Library/
      - Tools/
      - Assets/Editor/
      - Logs/
    keywords:
      - manifest
      - checksum
      - AddressablesPlayerBuildResult
      - build report
      - size report
      - Analyze
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_asset_pipeline_build_release_and_cicd_q7
  question: 构建好的 Catalog、AssetBundle 或原始资源是否在流水线中自动上传到 CDN / OSS，对应脚本和回源路径在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Tools/
      - Assets/Editor/
      - Assets/AddressableAssetsData/
      - Scripts/
    keywords:
      - upload
      - CDN
      - OSS
      - S3
      - catalog
      - AssetBundle
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_asset_pipeline_build_release_and_cicd_q8
  question: 流水线里是否有资源构建质量门，例如重复依赖检查、缺失引用检查、Bundle 体积阈值或目录规范校验？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Editor/
      - Tools/
      - Assets/AddressableAssetsData/
    keywords:
      - CheckDuplicateBundleDependencies
      - Analyze
      - validation
      - missing reference
      - size limit
      - gate
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_asset_pipeline_build_release_and_cicd_q9
  question: 为了加速 CI，资源构建是否复用了 Library、Addressables 构建缓存或导入缓存，缓存失效策略是什么？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Tools/
      - Library/
      - Assets/Editor/
      - ProjectSettings/
    keywords:
      - Library
      - BuildCache
      - CacheServer
      - incremental import
      - reuse
      - cache key
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_asset_pipeline_build_release_and_cicd_q10
  question: 项目是否支持只发资源不发包的独立内容发布，如果远端资源发布失败或需要回滚，回滚入口和历史版本记录在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Tools/
      - Assets/AddressableAssetsData/
      - Assets/Editor/
      - Scripts/
    keywords:
      - content update
      - rollback
      - previous build
      - catalog rollback
      - release history
      - remote content
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

  - `BuildProfile`
  - `RemoteLoadPath`
  - `AddressablesPlayerBuildResult`
  - `Analyze`
  - `batchmode`
  - `executeMethod`
  - `catalog`
