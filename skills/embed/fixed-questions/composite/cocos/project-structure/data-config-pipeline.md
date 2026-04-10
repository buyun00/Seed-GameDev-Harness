---
name: fixed-questions-composite-cocos-project-structure-data-config-pipeline
description: cocos / project-structure x data-config-pipeline 交叉固定问题模板
composite_id: composite.cocos.project_structure.data_config_pipeline
axis: composite
engine: cocos
direction_id: project_structure
capability: data_config_pipeline
capability_id: data_config_pipeline
owner: builder-engine
researcher_owner: researcher-cocos
capability_owner: researcher-config
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.cocos.project_structure.data_config_pipeline` 的交叉固定问题模板。
- 只补充 `engine.cocos.project_structure` 与 `capability.data_config_pipeline` 同时成立时新增的固定问题。
- 不重复 `fixed-questions/engine/cocos/project-structure.md` 和 `fixed-questions/capability/data-config-pipeline.md` 已覆盖的基础问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。
- 当前先留空模板，后续按实际项目与复用频次补充问题。

## 固定问题

- id: cocos_project_structure_data_config_pipeline_q1
  question: 配置表源文件、Schema 和导表脚本在项目目录结构中分别位于哪里，它们与 `assets/` 下运行时配置资源的边界是否清晰？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - assets/config/
      - tools/
      - scripts/
      - extensions/
      - assets/resources/
    keywords:
      - config
      - schema
      - codegen
      - export
      - generated
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_project_structure_data_config_pipeline_q2
  question: 导表生成物最终写入 `assets/resources`、bundle 目录、原生资源目录还是独立远端目录，目录规划是否能直接反映业务模块归属？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/resources/
      - assets/bundles/
      - assets/config/
      - remote-assets/
      - native/
    keywords:
      - bundle
      - resources
      - remote
      - config
      - module
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_project_structure_data_config_pipeline_q3
  question: 项目是否使用 `tools/`、`scripts/`、`extensions/` 或外部仓库来承载导表工具，真正被 Cocos 工程依赖的入口目录是哪一层？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - tools/
      - scripts/
      - extensions/
      - package.json
      - assets/
    keywords:
      - codegen
      - config tool
      - import
      - extension
      - script
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_project_structure_data_config_pipeline_q4
  question: 生成的配置 JSON、二进制文件、类型定义和索引代码是否都提交到仓库；若有的提交、有的不提交，忽略规则写在何处？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - .gitignore
      - assets/config/
      - assets/generated/
      - tools/
      - scripts/
    keywords:
      - generated
      - json
      - binary
      - d.ts
      - ignore
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_project_structure_data_config_pipeline_q5
  question: 环境配置、渠道配置、多语言配置和正式游戏配置在目录上是如何分层的，运行时合并顺序是否能从工程结构直接看出来？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/config/
      - profiles/
      - settings/
      - assets/i18n/
      - scripts/
    keywords:
      - env
      - channel
      - locale
      - merge
      - profile
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_project_structure_data_config_pipeline_q6
  question: 配置加载门面位于哪个模块，它是按目录约定扫描、按 bundle 注册还是通过显式索引表定位配置资源的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/scripts/
      - assets/src/
      - assets/config/
      - assets/resources/
      - assets/bundles/
    keywords:
      - ConfigManager
      - registry
      - loadBundle
      - resources.load
      - index
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_project_structure_data_config_pipeline_q7
  question: 导表后生成的 `.meta`、uuid 或 asset-db 记录是否会被稳定复用，还是每次重导都允许变更；相关约束写在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/config/
      - assets/resources/
      - extensions/
      - settings/
      - tools/
    keywords:
      - .meta
      - uuid
      - asset-db
      - reimport
      - stable
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_project_structure_data_config_pipeline_q8
  question: 是否存在编辑器扩展或构建钩子在资源导入前后自动触发导表、校验和 reimport，扩展目录与运行时代码是否清楚隔离？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - extensions/
      - tools/
      - scripts/
      - assets/
      - profiles/
    keywords:
      - builder
      - reimport
      - validate
      - extension
      - hook
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_project_structure_data_config_pipeline_q9
  question: 原生平台、热更新目录和普通运行时目录中的配置资源是否有明确分仓，是否能从工程结构中一眼看出“首包配置”和“远端配置”的分界？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - assets/resources/
      - assets/bundles/
      - remote-assets/
      - native/
      - manifest/
    keywords:
      - remote config
      - hotupdate
      - package
      - config
      - manifest
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: cocos_project_structure_data_config_pipeline_q10
  question: 是否存在针对配置目录结构、命名规范、Schema 演进或生成物位置的自动化检查脚本，还是完全依赖人工约定？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - tools/
      - scripts/
      - .github/
      - ci/
      - package.json
    keywords:
      - lint
      - validate
      - schema
      - convention
      - check
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
