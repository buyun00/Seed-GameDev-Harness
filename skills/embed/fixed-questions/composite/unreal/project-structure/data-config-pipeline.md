---
name: fixed-questions-composite-unreal-project-structure-data-config-pipeline
description: unreal / project-structure x data-config-pipeline 交叉固定问题模板
composite_id: composite.unreal.project_structure.data_config_pipeline
axis: composite
engine: unreal
direction_id: project_structure
capability: data_config_pipeline
capability_id: data_config_pipeline
owner: builder-unreal
researcher_owner: researcher-unreal
capability_owner: researcher-config
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.unreal.project_structure.data_config_pipeline` 的交叉固定问题模板。
- 只补充 `engine.unreal.project_structure` 与 `capability.data_config_pipeline` 同时成立时新增的固定问题。
- 不重复 `fixed-questions/engine/unreal/project-structure.md` 与 `fixed-questions/capability/data-config-pipeline.md` 已覆盖的基础问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。

## 固定问题

- id: unreal_project_structure_data_config_pipeline_q1
  question: 数据定义层在项目结构里如何分区，`Source/` 中的 row struct、loader、validator 与 `Content/` 中的 `DataAsset/DataTable` 是否一一对应？
  must_find: true
  fatal_if_missing: true
  search_hints:
    paths:
      - "Source/"
      - "Source/**/*Data*"
      - "Content/Data/"
      - "Content/Config/"
      - "Content/**/DT_*"
    keywords:
      - "USTRUCT"
      - "DataTable"
      - "DataAsset"
      - "Validate"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_project_structure_data_config_pipeline_q2
  question: `Config/`、`Content/`、`Plugins/`、`Source/` 之间的数据职责如何划分，哪些配置放 ini，哪些数据必须做成资产？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/"
      - "Source/**/*Config*"
      - "Source/**/*Settings*"
      - "Content/"
      - "Plugins/"
    keywords:
      - "DefaultGame.ini"
      - "UDeveloperSettings"
      - "DataAsset"
      - "DataTable"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_project_structure_data_config_pipeline_q3
  question: 是否存在专门的数据模块、编辑器模块或插件，用来承载导表、校验、生成器或命令行工具，而不是散落在 gameplay 模块里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*.Build.cs"
      - "Plugins/"
      - "Source/**/*Editor*"
      - "Source/**/*Commandlet*"
      - "Tools/"
    keywords:
      - "Editor"
      - "Commandlet"
      - "Import"
      - "Validator"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_project_structure_data_config_pipeline_q4
  question: 平台配置、设备档位配置和通用玩法配置是否按 Unreal ini 层级拆分，覆盖顺序在项目中是否清晰可追踪？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Config/"
      - "Config/Windows/"
      - "Config/Android/"
      - "Config/IOS/"
      - "Source/**/*Settings*"
    keywords:
      - "DeviceProfile"
      - "WindowsEngine.ini"
      - "AndroidGame.ini"
      - "Scalability"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_project_structure_data_config_pipeline_q5
  question: 项目是否约定统一的数据目录和命名规范，例如 `Content/Data/`、`Content/Config/`、`DA_*`、`DT_*`？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Content/"
      - "Content/Data/"
      - "Content/Config/"
      - "Content/**/DA_*"
      - "Content/**/DT_*"
    keywords:
      - "DA_"
      - "DT_"
      - "Data"
      - "Config"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_project_structure_data_config_pipeline_q6
  question: 插件自带内容与项目主内容的配置数据是否会合并加载，插件内 `Config/` 与项目根 `Config/` 的覆盖关系如何处理？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Plugins/"
      - "Plugins/**/Config/"
      - "Plugins/**/Content/"
      - "*.uplugin"
      - "Config/"
    keywords:
      - "CanContainContent"
      - "Config"
      - "Modules"
      - "AdditionalDependencies"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_project_structure_data_config_pipeline_q7
  question: 数据导入脚本、生成脚本和运行时读取代码是否保持同域组织，便于从一个数据实体反查到结构定义和导入来源？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Import*"
      - "Source/**/*Data*"
      - "Scripts/"
      - "Tools/"
      - "Content/Data/"
    keywords:
      - "Import"
      - "Generate"
      - "FindRow"
      - "DataRegistry"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_project_structure_data_config_pipeline_q8
  question: 是否有专门的测试、验证或命令式入口来跑数据检查，例如 commandlet、automation test、editor utility 或 pre-submit 检查？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Source/**/*Commandlet*"
      - "Source/**/*Test*"
      - "Source/**/*Validate*"
      - "Build/"
      - "Scripts/"
    keywords:
      - "AutomationTest"
      - "Commandlet"
      - "Validate"
      - "PreSubmit"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_project_structure_data_config_pipeline_q9
  question: 生成态数据、缓存数据、cook 产物与源数据是否有明确目录隔离，避免把 `Saved/` 或中间导出文件误当成源配置？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Saved/"
      - "Intermediate/"
      - "DerivedDataCache/"
      - "Content/"
      - "Build/"
    keywords:
      - "Generated"
      - "Saved"
      - "Intermediate"
      - "DerivedDataCache"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unreal_project_structure_data_config_pipeline_q10
  question: 构建脚本或工具链在扫描数据源时，是基于固定目录约定、`AssetManager` 扫描、模块注册，还是手工列表？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - "Build/"
      - "Scripts/"
      - "Source/**/*AssetManager*"
      - "Source/**/*.Build.cs"
      - "Config/DefaultEngine.ini"
    keywords:
      - "PrimaryAssetTypesToScan"
      - "ScanPathsSynchronous"
      - "Register"
      - "Directory"
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
