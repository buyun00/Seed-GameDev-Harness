---
name: fixed-questions-composite-godot-asset-pipeline-build-release-and-cicd
description: godot / asset-pipeline x build-release-and-cicd 交叉固定问题模板
composite_id: composite.godot.asset_pipeline.build_release_and_cicd
axis: composite
engine: godot
direction_id: asset_pipeline
capability: build_release_and_cicd
capability_id: build_release_and_cicd
owner: builder-godot
researcher_owner: researcher-godot
capability_owner: researcher-infra
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.godot.asset_pipeline.build_release_and_cicd` 的交叉固定问题模板。
- 这里只补 `engine.godot.asset_pipeline` 与 `capability.build_release_and_cicd` 叠加后新增的必查问题。
- 不重复 `fixed-questions/engine/godot/asset-pipeline.md` 和 `fixed-questions/capability/build-release-and-cicd.md` 已覆盖的基础问题。
- 每条问题都单独给出 `search_hints.paths` 与 `search_hints.keywords`，目录 hint 已下沉到问题级别。

## 交叉固定问题

- id: godot_asset_pipeline_build_release_and_cicd_q1
  question: CI 在执行 Godot 导出前，是否会先运行一次 headless 编辑器导入或重导入，确保 `.godot/imported`、导入缓存和导入产物在干净机器上完整生成？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - .godot/
      - .godot/imported/
      - .github/workflows/
      - build/
      - ci/
      - tools/
    keywords:
      - --headless
      - --import
      - reimport
      - editor
      - imported
      - godot
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_asset_pipeline_build_release_and_cicd_q2
  question: `export_presets.cfg` 中是否为客户端、专用服务器、PCK-only、补丁包或 DLC 分开定义了导出预设，这些预设分别包含哪些资源过滤规则？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - export_presets.cfg
      - .godot/
      - build/
      - release/
      - deploy/
    keywords:
      - export_presets.cfg
      - dedicated_server
      - export_filter
      - include_filter
      - exclude_filter
      - patch
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_asset_pipeline_build_release_and_cicd_q3
  question: 流水线里实际调用的是 `--export-release`、`--export-debug` 还是 `--export-pack`，不同命令对应的输出文件命名和产物目录写在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - .github/workflows/
      - ci/
      - build/
      - scripts/
      - tools/
      - Makefile
    keywords:
      - --export-release
      - --export-debug
      - --export-pack
      - artifacts
      - output
      - godot
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_asset_pipeline_build_release_and_cicd_q4
  question: 哪些运行时必需的非 `Resource` 文件需要通过导出过滤器或 Keep File 原样打包进入构建产物，例如 `.json`、`.csv`、`.cfg`、`.lua` 或自定义字节文件？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - export_presets.cfg
      - data/
      - config/
      - tables/
      - lua/
      - assets/
    keywords:
      - Keep File
      - .json
      - .csv
      - .cfg
      - .lua
      - non-resource
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_asset_pipeline_build_release_and_cicd_q5
  question: 如果项目使用 `EditorImportPlugin`、自定义 `ResourceFormatLoader`、`ResourceFormatSaver` 或 GDExtension 参与资源转换，CI 机器如何保证这些导入能力在导出前可用？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - addons/
      - editor/
      - tools/
      - bin/
      - lib/
      - "*.gdextension"
    keywords:
      - EditorImportPlugin
      - ResourceFormatLoader
      - ResourceFormatSaver
      - GDExtension
      - import plugin
      - register_types
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_asset_pipeline_build_release_and_cicd_q6
  question: 是否存在面向热修复、增量更新或 mod 的 `PCK`、`ZIP` 打包流程，资源包的加载顺序、覆盖策略和命名约定在哪里定义？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - build/
      - patch/
      - hotfix/
      - dlc/
      - mods/
      - scripts/
    keywords:
      - PCKPacker
      - load_resource_pack
      - patch
      - dlc
      - mod
      - zip
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_asset_pipeline_build_release_and_cicd_q7
  question: 多平台导出时，纹理压缩、平台专属资源、平台二进制库或 `.gdextension` 动态库是如何在流水线中分平台收集和校验的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - .github/workflows/
      - build/
      - android/
      - ios/
      - bin/
      - "*.gdextension"
    keywords:
      - android
      - ios
      - windows
      - linux
      - texture
      - gdextension
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_asset_pipeline_build_release_and_cicd_q8
  question: 如果存在 dedicated server 构建，资源导出模式是否切到 `Export as dedicated server` 或使用了 `dedicated_server` feature tag，哪些视觉资源被保留或剔除了？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - export_presets.cfg
      - server/
      - dedicated_server/
      - build/
      - .github/workflows/
    keywords:
      - dedicated_server
      - Export as dedicated server
      - server
      - feature tag
      - strip
      - exclude
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_asset_pipeline_build_release_and_cicd_q9
  question: 导出凭据、脚本加密、Android 或 iOS 签名以及平台权限这类敏感配置，是否通过 `.godot/export_credentials.cfg`、环境变量或 CI secret 注入？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - .godot/
      - .github/workflows/
      - ci/
      - android/
      - ios/
      - build/
    keywords:
      - export_credentials.cfg
      - keystore
      - secret
      - env
      - signing
      - credentials
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_asset_pipeline_build_release_and_cicd_q10
  question: 构建后是否有自动化校验步骤确认关键资源可被导出的包正常加载，例如启动 smoke test、校验 `res://` 路径、验证 pack 可挂载或检测缺失导入资源？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - tests/
      - qa/
      - smoke/
      - .github/workflows/
      - scripts/
      - build/
    keywords:
      - smoke
      - test
      - res://
      - load_resource_pack
      - missing resource
      - verify
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
