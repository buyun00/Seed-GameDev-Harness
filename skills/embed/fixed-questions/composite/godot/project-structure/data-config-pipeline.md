---
name: fixed-questions-composite-godot-project-structure-data-config-pipeline
description: godot / project-structure x data-config-pipeline 交叉固定问题模板
composite_id: composite.godot.project_structure.data_config_pipeline
axis: composite
engine: godot
direction_id: project_structure
capability: data_config_pipeline
capability_id: data_config_pipeline
owner: builder-godot
researcher_owner: researcher-godot
capability_owner: researcher-config
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.godot.project_structure.data_config_pipeline` 的交叉固定问题模板。
- 这里只补 `engine.godot.project_structure` 与 `capability.data_config_pipeline` 叠加后新增的必查问题。
- 不重复 `fixed-questions/engine/godot/project-structure.md` 和 `fixed-questions/capability/data-config-pipeline.md` 已覆盖的基础问题。
- 每条问题都单独给出 `search_hints.paths` 与 `search_hints.keywords`，目录 hint 已下沉到问题级别。

## 固定问题

- id: godot_project_structure_data_config_pipeline_q1
  question: 配置源文件、schema、生成脚本、导出产物和运行时消费层在项目目录中分别落在哪些顶层或 feature 目录下，是否有统一命名约定？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - data/
      - config/
      - tables/
      - schema/
      - generated/
      - resources/
    keywords:
      - schema
      - generated
      - config
      - table
      - resource
      - naming
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_project_structure_data_config_pipeline_q2
  question: editor-only 的导表或校验脚本是否被放在 `addons/`、工具目录或 `@tool` 脚本里，并与运行时读取配置的脚本明确隔离？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - addons/
      - tools/
      - editor/
      - scripts/
      - "*.gd"
      - "*.cs"
    keywords:
      - @tool
      - tool
      - editor
      - validate
      - export
      - config
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_project_structure_data_config_pipeline_q3
  question: 运行时真正加载的配置目录是原始文本目录还是生成后的 `Resource` 目录，目录边界是否能从 `load()`、`preload()`、`ResourceLoader` 或 autoload 服务中直接看出来？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - autoload/
      - scripts/
      - config/
      - data/
      - resources/
      - "*.gd"
    keywords:
      - load(
      - preload(
      - ResourceLoader
      - FileAccess
      - autoload
      - res://
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_project_structure_data_config_pipeline_q4
  question: 配置服务入口是否集中在某个 autoload、singleton 或 manager 中，调用方是按路径直接读文件，还是统一通过配置层取数据？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - autoload/
      - systems/
      - services/
      - scripts/
      - "*.gd"
      - project.godot
    keywords:
      - autoload
      - singleton
      - ConfigManager
      - ConfigService
      - get_config
      - project.godot
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_project_structure_data_config_pipeline_q5
  question: 自定义配置类型如果使用 `Resource` 或 `class_name`，这些类型定义文件放在哪里，是否形成独立的 `config_types`、`resources` 或 `models` 层？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - resources/
      - models/
      - config_types/
      - config/
      - "*.gd"
      - "*.tres"
    keywords:
      - extends Resource
      - class_name
      - model
      - config_type
      - resource
      - @export
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_project_structure_data_config_pipeline_q6
  question: 原始数据与生成数据是否都进入版本控制，哪些目录会被 `.gdignore`、`.gitignore` 或导出过滤规则排除？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - .gitignore
      - "*.gdignore"
      - export_presets.cfg
      - generated/
      - data/
      - config/
    keywords:
      - .gdignore
      - .gitignore
      - generated
      - export_filter
      - ignore
      - exclude
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_project_structure_data_config_pipeline_q7
  question: 是否存在按平台、环境、渠道或 feature folder 拆分的配置目录，覆盖顺序和回退规则是怎样在目录结构上表达的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - config/
      - data/
      - environments/
      - platform/
      - locales/
      - channels/
    keywords:
      - dev
      - prod
      - staging
      - android
      - ios
      - override
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_project_structure_data_config_pipeline_q8
  question: 配置生成脚本、CI 产物和最终导出资源之间的路径映射是否稳定，是否需要手工同步多个目录才能让配置变更生效？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - tools/
      - scripts/
      - generated/
      - build/
      - .github/workflows/
      - config/
    keywords:
      - generated
      - output
      - copy
      - sync
      - build
      - config
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_project_structure_data_config_pipeline_q9
  question: 是否有专门目录承载可热更、可 patch、可 mod 的配置包，运行时配置覆盖是不是依赖固定目录层级或 pack 加载顺序？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - patch/
      - hotfix/
      - mods/
      - dlc/
      - config/
      - autoload/
    keywords:
      - load_resource_pack
      - patch
      - hotfix
      - mod
      - override
      - config
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_project_structure_data_config_pipeline_q10
  question: 配置读取方、配置定义方和导表方如果分属不同模块或 addon，模块边界在目录结构上是如何体现和解耦的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - addons/
      - modules/
      - systems/
      - services/
      - config/
      - tools/
    keywords:
      - addon
      - module
      - service
      - config
      - import
      - boundary
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
