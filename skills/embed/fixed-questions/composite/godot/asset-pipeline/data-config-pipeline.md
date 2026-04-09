---
name: fixed-questions-composite-godot-asset-pipeline-data-config-pipeline
description: godot / asset-pipeline x data-config-pipeline 交叉固定问题模板
composite_id: composite.godot.asset_pipeline.data_config_pipeline
axis: composite
engine: godot
direction_id: asset_pipeline
capability: data_config_pipeline
capability_id: data_config_pipeline
owner: builder-godot
researcher_owner: researcher-godot
capability_owner: researcher-config
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.godot.asset_pipeline.data_config_pipeline` 的交叉固定问题模板。
- 这里只补 `engine.godot.asset_pipeline` 与 `capability.data_config_pipeline` 叠加后新增的必查问题。
- 不重复 `fixed-questions/engine/godot/asset-pipeline.md` 和 `fixed-questions/capability/data-config-pipeline.md` 已覆盖的基础问题。
- 每条问题都单独给出 `search_hints.paths` 与 `search_hints.keywords`，目录 hint 已下沉到问题级别。

## 交叉固定问题

- id: godot_asset_pipeline_data_config_pipeline_q1
  question: 配置数据源文件最终是以原始文本文件形式随包导出，还是在导入阶段被转换成 `.tres`、`.res` 或自定义 `Resource` 后再由运行时加载？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - data/
      - config/
      - tables/
      - resources/
      - "*.tres"
      - "*.res"
    keywords:
      - ResourceLoader
      - FileAccess
      - .tres
      - .res
      - json
      - csv
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_asset_pipeline_data_config_pipeline_q2
  question: 项目是否通过 `EditorImportPlugin`、`ResourceFormatLoader`、`ResourceFormatSaver` 或编辑器工具脚本，把 `.json`、`.csv`、`.xlsx`、`.cfg` 等配置源转成 Godot 资源资产？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - addons/
      - editor/
      - tools/
      - data/
      - config/
      - "*.gd"
    keywords:
      - EditorImportPlugin
      - ResourceFormatLoader
      - ResourceFormatSaver
      - @tool
      - csv
      - json
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_asset_pipeline_data_config_pipeline_q3
  question: 配置资源的重导入触发条件是什么，源表修改后是靠 Import dock、自动 reimport、外部脚本还是自定义菜单动作生成运行时可消费产物？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - addons/
      - editor/
      - tools/
      - ".godot/"
      - data/
      - config/
    keywords:
      - reimport
      - import
      - changed
      - watcher
      - @tool
      - EditorPlugin
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_asset_pipeline_data_config_pipeline_q4
  question: 运行时读取配置时使用的是 `ResourceLoader` 还是 `FileAccess`，如果是原始文本文件，导出预设如何保证这些文件没有在导出时被遗漏？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - scripts/
      - autoload/
      - data/
      - config/
      - export_presets.cfg
      - "*.gd"
    keywords:
      - ResourceLoader
      - FileAccess
      - load(
      - preload(
      - export_presets.cfg
      - Keep File
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_asset_pipeline_data_config_pipeline_q5
  question: 配置类型是否通过自定义 `Resource`、`class_name`、子资源嵌套和 `@export` 字段来表达 schema、默认值和引用关系？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - resources/
      - config/
      - data/
      - scripts/
      - "*.gd"
      - "*.tres"
    keywords:
      - extends Resource
      - class_name
      - @export
      - export
      - sub_resource
      - schema
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_asset_pipeline_data_config_pipeline_q6
  question: 是否存在 editor-only 的源表目录与 runtime-only 的生成目录，二者的命名、引用方向和版本控制策略是什么？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - editor/
      - tools/
      - generated/
      - data/
      - config/
      - ".gitignore"
    keywords:
      - generated
      - source
      - runtime
      - editor_only
      - ignore
      - export
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_asset_pipeline_data_config_pipeline_q7
  question: 配置管线里是否会把路径型引用、UID、`res://` 资源路径或场景路径在导入时转成可直接实例化或加载的 Godot 引用？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - data/
      - config/
      - resources/
      - scenes/
      - "*.gd"
      - "*.tres"
    keywords:
      - res://
      - PackedScene
      - load(
      - preload(
      - uid
      - path
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_asset_pipeline_data_config_pipeline_q8
  question: 配置导入失败、schema 校验失败、字段缺失或类型不匹配时，错误会在导入阶段、编辑器日志、资源保存阶段还是运行时才暴露？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - addons/
      - editor/
      - tools/
      - logs/
      - data/
      - config/
    keywords:
      - error
      - push_error
      - printerr
      - validation
      - schema
      - parse
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_asset_pipeline_data_config_pipeline_q9
  question: 是否有为本地化、平台差异或环境差异准备多套配置资源，资源导出时又是通过不同 preset、feature tag 还是 pack 覆盖来区分？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - data/
      - config/
      - locales/
      - export_presets.cfg
      - patch/
      - dlc/
    keywords:
      - locale
      - zh
      - en
      - feature
      - preset
      - override
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: godot_asset_pipeline_data_config_pipeline_q10
  question: 如果项目支持补丁包或资源包覆盖，配置 `Resource` 的缓存、重新加载和路径覆盖顺序是如何处理的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - patch/
      - hotfix/
      - mods/
      - autoload/
      - scripts/
      - "*.gd"
    keywords:
      - load_resource_pack
      - cache
      - reload
      - ResourceLoader
      - override
      - hotfix
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
