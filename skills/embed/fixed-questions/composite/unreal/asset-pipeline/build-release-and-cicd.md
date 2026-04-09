---
name: fixed-questions-composite-unreal-asset-pipeline-build-release-and-cicd
description: unreal / asset-pipeline x build-release-and-cicd 交叉固定问题模板
composite_id: composite.unreal.asset_pipeline.build_release_and_cicd
axis: composite
engine: unreal
direction_id: asset_pipeline
capability: build_release_and_cicd
capability_id: build_release_and_cicd
owner: builder-unreal
researcher_owner: researcher-unreal
capability_owner: researcher-infra
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.unreal.asset_pipeline.build_release_and_cicd` 的交叉固定问题模板。
- 只补充 `engine.unreal.asset_pipeline` 与 `capability.build_release_and_cicd` 同时成立时新增的固定问题。
- 不重复 `fixed-questions/engine/unreal/asset-pipeline.md` 与 `fixed-questions/capability/build-release-and-cicd.md` 已覆盖的基础问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。

## 交叉固定问题

- id: unreal_asset_pipeline_build_release_and_cicd_q1
  question: 资源构建与发版流水线是否显式通过 `RunUAT BuildCookRun`、`BuildGraph` 或自定义 UAT 命令驱动，入口脚本在哪里？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - "Build/"
      - "Build/**/*.xml"
      - "Scripts/"
      - "Tools/"
      - ".github/workflows/"
      - "Jenkinsfile"
    keywords:
      - "RunUAT"
      - "BuildCookRun"
      - "BuildGraph"
      - "AutomationTool"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_asset_pipeline_build_release_and_cicd_q2
  question: 资源 cook 输入边界是如何定义的，是否通过 `AssetManager`、`PrimaryAssetLabel`、目录白名单或 `DirectoriesToAlwaysCook` 控制？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/DefaultEngine.ini"
      - "Config/DefaultGame.ini"
      - "Config/*Engine.ini"
      - "Config/*Game.ini"
      - "Source/**/*.cpp"
    keywords:
      - "DirectoriesToAlwaysCook"
      - "PrimaryAssetLabel"
      - "PrimaryAssetTypesToScan"
      - "AssetManager"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_asset_pipeline_build_release_and_cicd_q3
  question: 构建前是否存在资源预检查步骤，例如 `Redirector` 清理、缺失软引用检查、未保存资产扫描或资源合法性校验？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Build/"
      - "Scripts/"
      - "Source/**/*Commandlet*"
      - "Source/**/*Validate*"
      - "Plugins/**/*Commandlet*"
    keywords:
      - "FixupRedirectors"
      - "Validate"
      - "IsDataValid"
      - "ResavePackages"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_asset_pipeline_build_release_and_cicd_q4
  question: 发版产物是否明确区分 `pak`、`ucas`、`utoc`、`AssetRegistry.bin`、chunk manifest 等资源侧工件，归档规则在哪里定义？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Build/"
      - "Scripts/"
      - "Config/"
      - "Source/**/*.cs"
      - "Saved/"
    keywords:
      - ".pak"
      - ".ucas"
      - ".utoc"
      - "AssetRegistry.bin"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_asset_pipeline_build_release_and_cicd_q5
  question: 资源分 chunk 的规则是否直接参与 patch、DLC 或增量包发布，`ChunkId` 与发布版本的映射关系写在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/DefaultGame.ini"
      - "Config/DefaultEngine.ini"
      - "Content/"
      - "Build/"
      - "Scripts/"
    keywords:
      - "ChunkId"
      - "PrimaryAssetLabel"
      - "CreateReleaseVersion"
      - "BasedOnReleaseVersion"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_asset_pipeline_build_release_and_cicd_q6
  question: 多平台构建时，资源 cook 规则是否按平台差异化覆盖，例如平台专属目录、平台专属 ini、纹理格式或压缩策略切换？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/"
      - "Config/Windows/"
      - "Config/Android/"
      - "Config/IOS/"
      - "Build/"
    keywords:
      - "WindowsEngine.ini"
      - "AndroidEngine.ini"
      - "TextureFormat"
      - "CookFlavor"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_asset_pipeline_build_release_and_cicd_q7
  question: 流水线是否依赖共享 `DerivedDataCache`、Zen 或远程缓存缩短 cook 时间，缓存命中与失效策略在哪里体现？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/"
      - "Build/"
      - "Scripts/"
      - "Engine/Programs/"
      - "Source/**/*.cs"
    keywords:
      - "DerivedDataCache"
      - "SharedDDC"
      - "Zen"
      - "InstalledDerivedDataBackendGraph"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_asset_pipeline_build_release_and_cicd_q8
  question: 资源审计结果是否会阻断发版，例如包体超限、非法 editor-only 引用、未压缩大纹理或未分 chunk 的大资源？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Build/"
      - "Scripts/"
      - "Source/**/*Audit*"
      - "Source/**/*Size*"
      - "Plugins/**/*Audit*"
    keywords:
      - "AssetAudit"
      - "SizeMap"
      - "EditorOnly"
      - "CookRule"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_asset_pipeline_build_release_and_cicd_q9
  question: 项目是否生成用于分发或校验的资源清单，例如 manifest、hash、版本文件、chunk install data 或白名单？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Build/"
      - "Scripts/"
      - "Saved/"
      - "Content/"
      - "Source/**/*.cpp"
    keywords:
      - "Manifest"
      - "Hash"
      - "ChunkInstall"
      - "AssetRegistry"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_asset_pipeline_build_release_and_cicd_q10
  question: 版本升级或补丁发布时，是否存在面向资源的 release version、patch manifest 或旧版本对比流程？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Build/"
      - "Scripts/"
      - "Config/"
      - "Tools/"
      - "Source/**/*.cs"
    keywords:
      - "CreateReleaseVersion"
      - "BasedOnReleaseVersion"
      - "GeneratePatch"
      - "ReleaseVersion"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
