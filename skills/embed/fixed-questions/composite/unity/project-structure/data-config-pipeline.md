---
name: fixed-questions-composite-unity-project-structure-data-config-pipeline
description: unity / project-structure x data-config-pipeline 交叉固定问题模板
composite_id: composite.unity.project_structure.data_config_pipeline
axis: composite
engine: unity
direction_id: project_structure
capability: data_config_pipeline
capability_id: data_config_pipeline
owner: builder-unity
researcher_owner: researcher-unity
capability_owner: researcher-config
scope:
  - agent-inject
---

## 填写说明

- 本文件是 `composite.unity.project_structure.data_config_pipeline` 的交叉固定问题模板。
- 这里只补 `engine.unity.project_structure` 与 `capability.data_config_pipeline` 同时成立时新增的固定问题。
- 不重复 `fixed-questions/engine/unity/project-structure.md` 和 `fixed-questions/capability/data-config-pipeline.md` 已覆盖的基础问题。
- 后续填写时，只写 researcher 必须在项目中找到实际实现的问题。

## 交叉固定问题

- id: unity_project_structure_data_config_pipeline_q1
  question: 配置源文件、Schema、导表工具、生成代码、生成资产和运行时加载器分别位于哪些目录，它们的分层边界是否清晰？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Tools/
      - ProjectSettings/
    keywords:
      - Config
      - Schema
      - Generated
      - table
      - loader
      - tool
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_project_structure_data_config_pipeline_q2
  question: 原始配置数据是否放在 Unity 工程外或 Assets 之外，再由工具同步进工程；同步边界和入口目录在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Tools/
      - ../
    keywords:
      - Excel
      - CSV
      - import
      - external
      - sync
      - source data
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_project_structure_data_config_pipeline_q3
  question: 配置导入和校验工具是否被单独放在 Editor 程序集、Tools 目录或 Package 中，以避免污染运行时代码？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Editor/
      - Tools/
      - Packages/
      - "*.asmdef"
    keywords:
      - Editor
      - asmdef
      - tool
      - validator
      - importer
      - package
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_project_structure_data_config_pipeline_q4
  question: 自动生成的配置类、枚举、索引和二进制资产是否与手写代码隔离存放，目录和命名约定是什么？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Tools/
    keywords:
      - Generated
      - AutoGen
      - enum
      - index
      - config class
      - bytes
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_project_structure_data_config_pipeline_q5
  question: 平衡数值、语言表、剧情表、网络协议配置等不同配置域是否分成独立模块或 Package，目录边界写在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Tools/
    keywords:
      - Localization
      - Balance
      - Story
      - Protocol
      - Module
      - Package
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_project_structure_data_config_pipeline_q6
  question: 运行时真正会被加载的配置产物是落在 Resources、StreamingAssets、Addressables 目录还是独立 Config 目录，结构上如何区分？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/Resources/
      - Assets/StreamingAssets/
      - Assets/AddressableAssetsData/
      - Assets/
    keywords:
      - Resources
      - StreamingAssets
      - Addressables
      - Config
      - TextAsset
      - ScriptableObject
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_project_structure_data_config_pipeline_q7
  question: 多环境、多渠道或多平台配置是否通过目录层级直接分开，例如 `Dev`、`Prod`、`CN`、`Oversea` 等分支目录？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Tools/
    keywords:
      - Dev
      - Prod
      - channel
      - CN
      - Oversea
      - platform
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_project_structure_data_config_pipeline_q8
  question: 配置校验样例、测试数据、导表说明文档和开发者约定是否与正式配置目录分离，方便 researcher 快速定位？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Tools/
      - Documentation/
    keywords:
      - README
      - docs
      - sample
      - testdata
      - validator
      - config guide
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_project_structure_data_config_pipeline_q9
  question: 从仓库根目录触发配置导表或重建时，应进入哪个工具目录、脚本目录或 Package 命令入口，仓库是否有固定约定？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Tools/
      - Assets/Editor/
      - Packages/
      - Scripts/
    keywords:
      - build config
      - regenerate
      - executeMethod
      - MenuItem
      - command line
      - tool entry
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: unity_project_structure_data_config_pipeline_q10
  question: Excel 库、Proto 编译器、CSV 解析器或第三方导表依赖是集中放在仓库哪个位置，是否有专门的 vendor / third-party 边界？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - Assets/
      - Packages/
      - Tools/
      - Plugins/
    keywords:
      - ThirdParty
      - vendor
      - protobuf
      - ExcelDataReader
      - CSV
      - dependency
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

## 交叉搜索提示

- paths:
  - `Assets/`
  - `Assets/Editor/`
  - `Assets/Resources/`
  - `Assets/StreamingAssets/`
  - `Assets/AddressableAssetsData/`
  - `Packages/`
  - `Tools/`
  - `Documentation/`
- keywords:
  - `Config`
  - `Schema`
  - `Generated`
  - `AutoGen`
  - `Excel`
  - `CSV`
  - `protobuf`
  - `validator`
  - `Resources`
  - `Addressables`
