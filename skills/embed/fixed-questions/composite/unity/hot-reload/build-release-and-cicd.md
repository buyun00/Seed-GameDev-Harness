---
name: fixed-questions-composite-unity-hot-reload-build-release-and-cicd
description: unity / hot-reload x build-release-and-cicd 交叉固定问题模板
composite_id: composite.unity.hot_reload.build_release_and_cicd
axis: composite
engine: unity
direction_id: hot_reload
capability: build_release_and_cicd
capability_id: build_release_and_cicd
owner: builder-engine
researcher_owner: researcher-unity
capability_owner: researcher-infra
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.unity.hot_reload.build_release_and_cicd` 的交叉固定问题模板。
- 这里只补 `engine.unity.hot_reload` 与 `capability.build_release_and_cicd` 同时成立时新增的固定问题。
- 不重复 `fixed-questions/engine/unity/hot-reload.md` 和 `fixed-questions/capability/build-release-and-cicd.md` 已覆盖的基础问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。

## 固定问题

- id: unity_hot_reload_build_release_and_cicd_q1
  question: 热更新相关产物的构建入口是什么，CI 流水线在哪一步生成热更 DLL、补丁包或热更资源？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Editor/
      - Tools/
      - Packages/
      - ProjectSettings/
    keywords:
      - HybridCLR
      - ILRuntime
      - hotfix
      - BuildPipeline
      - CI
      - patch
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_hot_reload_build_release_and_cicd_q2
  question: AOT 元数据补充、CLR Binding、适配器生成、热更程序集拷贝等预处理步骤是否被纳入流水线，入口脚本写在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Editor/
      - Tools/
      - Packages/
    keywords:
      - LoadMetadataForAOTAssembly
      - GenerateCLRBinding
      - CrossBindingAdaptor
      - CopyDll
      - GenerateAll
      - metadata
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_hot_reload_build_release_and_cicd_q3
  question: 宿主包版本与热更包版本的兼容关系如何记录，是否存在 Manifest、版本矩阵或最低宿主版本校验？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Tools/
      - Assets/StreamingAssets/
      - Packages/
    keywords:
      - manifest
      - version
      - host version
      - compatibility
      - hotupdate
      - minimum version
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_hot_reload_build_release_and_cicd_q4
  question: 流水线是否同时支持全量热更包和增量补丁，两者的产物目录、命名规则和生成条件分别是什么？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Tools/
      - Assets/Editor/
      - Packages/
    keywords:
      - full package
      - incremental
      - patch
      - manifest
      - diff
      - output
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_hot_reload_build_release_and_cicd_q5
  question: 热更产物在发布前是否会做压缩、加密、签名或校验和生成，相关脚本和密钥注入点在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Tools/
      - Assets/Editor/
      - Assets/
    keywords:
      - encrypt
      - sign
      - checksum
      - md5
      - zip
      - aes
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_hot_reload_build_release_and_cicd_q6
  question: CI 是否在生成热更产物后自动做最小验证，例如启动宿主、加载热更程序集、补充 AOT 元数据或执行冒烟测试？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Tools/
      - Assets/Editor/
      - Packages/
      - Tests/
    keywords:
      - smoke test
      - load assembly
      - metadata
      - verify
      - runtime test
      - hotfix test
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_hot_reload_build_release_and_cicd_q7
  question: 热更包上传、灰度、分渠道发布和 CDN 路径切换是否在流水线自动完成，发布配置写在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Tools/
      - Assets/
      - Packages/
      - Scripts/
    keywords:
      - upload
      - CDN
      - gray
      - channel
      - remote url
      - release
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_hot_reload_build_release_and_cicd_q8
  question: 如果线上热更出现问题，回滚到上一版热更包的历史记录、归档目录和操作入口在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Tools/
      - Assets/
      - Scripts/
      - Packages/
    keywords:
      - rollback
      - archive
      - previous patch
      - release history
      - downgrade
      - manifest
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_hot_reload_build_release_and_cicd_q9
  question: 平台差异例如 Android / iOS / Windows 下的热更程序集、AOT 补数据和裁剪规则，是否在流水线中分平台处理？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Tools/
      - Assets/Editor/
      - ProjectSettings/
      - Packages/
    keywords:
      - Android
      - iOS
      - Windows
      - strip
      - link.xml
      - platform
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_hot_reload_build_release_and_cicd_q10
  question: 流水线是否会阻止“生成绑定未更新、程序集列表过期、元数据漏打或补丁清单不一致”的发布，阻断规则写在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Tools/
      - Assets/Editor/
      - Packages/
      - Tests/
    keywords:
      - validation
      - stale
      - dll list
      - metadata missing
      - fail build
      - gate
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

  - `GenerateCLRBinding`
  - `CopyDll`
  - `manifest`
  - `patch`
  - `rollback`
  - `gray`
  - `smoke test`
