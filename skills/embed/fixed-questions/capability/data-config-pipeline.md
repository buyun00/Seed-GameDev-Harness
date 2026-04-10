---
name: fixed-questions-capability-data-config-pipeline
description: 数据配置管线 固定问题模板
matrix_id: capability.data_config_pipeline
axis: capability
capability: data_config_pipeline
capability_id: data_config_pipeline
owner: researcher-config
question_set_id: qs-common-data-config-pipeline
scope:
  - agent-inject
---

## 填写说明

- 本文件是 capability.data_config_pipeline 的固定问题模板。
- 补充配置表、Schema、导表、校验与运行时消费链路上的固定问题。
- 后续填写时，只写该 capability 自己必须回答的问题，不要把引擎主线问题写进来。

## 固定问题

- id: capability_data_config_pipeline_q1
  question: 项目的原始配置源、Schema 定义、导表工具和运行时配置产物分别放在哪里？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `Assets/`
      - `Config/`
      - `Configs/`
      - `Data/`
      - `Tables/`
      - `Tools/`
      - `Editor/`
      - `Scripts/`
    keywords:
      - `*.xlsx`
      - `*.xls`
      - `*.csv`
      - `*.json`
      - `*.yaml`
      - `*.proto`
      - `Schema`
      - `Excel`
      - `Export`
      - `GenerateConfig`
      - `TableExport`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_data_config_pipeline_q2
  question: 配置导出或生成入口是什么，是命令行脚本、Editor 菜单、CI 步骤还是外部工具触发？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `Tools/`
      - `Editor/`
      - `Scripts/`
      - `.github/`
      - `.gitlab-ci.yml`
      - `Jenkinsfile`
      - `package.json`
      - `Makefile`
    keywords:
      - `Export`
      - `Generate`
      - `Import`
      - `MenuItem`
      - `Build`
      - `excel`
      - `table`
      - `config`
      - `proto`
      - `flatc`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_data_config_pipeline_q3
  question: 运行时配置加载器、注册表或访问器在哪里，业务代码通过什么 API 消费配置？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `Assets/`
      - `Scripts/`
      - `src/`
      - `Runtime/`
      - `Config/`
      - `cfg/`
    keywords:
      - `ConfigManager`
      - `Cfg`
      - `Table`
      - `LoadConfig`
      - `LoadTable`
      - `GetConfig`
      - `require`
      - `tab_`
      - `KEYMAP`
      - `Resources.Load`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_data_config_pipeline_q4
  question: 配置表的主键、索引、枚举、引用关系和缺省值约定在哪里定义或生成？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `Assets/`
      - `Config/`
      - `Configs/`
      - `Data/`
      - `Tables/`
      - `Tools/`
      - `Editor/`
    keywords:
      - `id`
      - `key`
      - `index`
      - `enum`
      - `default`
      - `KEYMAP`
      - `schema`
      - `validate`
      - `foreign`
      - `reference`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_data_config_pipeline_q5
  question: 配置校验、重复 ID 检查、字段类型检查或引用完整性检查由哪里执行？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `Tools/`
      - `Editor/`
      - `Scripts/`
      - `Tests/`
      - `.github/`
      - `.gitlab-ci.yml`
      - `Jenkinsfile`
    keywords:
      - `Validate`
      - `Check`
      - `Lint`
      - `Duplicate`
      - `Schema`
      - `TypeCheck`
      - `foreign`
      - `reference`
      - `CI`
      - `test`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_data_config_pipeline_q6
  question: 配置产物是以文本、Lua、JSON、二进制、protobuf、ScriptableObject 还是资源包形式进入运行时？
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths:
      - `Assets/`
      - `Resources/`
      - `StreamingAssets/`
      - `Config/`
      - `cfg/`
      - `res/`
      - `Generated/`
    keywords:
      - `.lua`
      - `.json`
      - `.bytes`
      - `.asset`
      - `.proto`
      - `ScriptableObject`
      - `protobuf`
      - `msgpack`
      - `Resources`
      - `StreamingAssets`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_data_config_pipeline_q7
  question: 多语言、多环境、多渠道或多平台配置差异是通过哪些目录、字段或构建步骤切换的？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `Assets/`
      - `Config/`
      - `Configs/`
      - `Localization/`
      - `I18N/`
      - `Build/`
      - `Editor/`
    keywords:
      - `locale`
      - `language`
      - `i18n`
      - `channel`
      - `platform`
      - `env`
      - `dev`
      - `prod`
      - `Android`
      - `iOS`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_data_config_pipeline_q8
  question: 配置热更、补丁、版本清单或增量更新链路是否存在，入口和限制在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `Assets/`
      - `StreamingAssets/`
      - `Build/`
      - `HotUpdate/`
      - `Patch/`
      - `Editor/`
      - `Tools/`
    keywords:
      - `HotUpdate`
      - `Patch`
      - `Version`
      - `Manifest`
      - `Bundle`
      - `RemoteConfig`
      - `UpdateConfig`
      - `diff`
      - `incremental`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_data_config_pipeline_q9
  question: 配置变更的开发约定、评审说明、策划文档或示例数据放在哪里？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `docs/`
      - `doc/`
      - `design/`
      - `策划/`
      - `文档/`
      - `README.md`
      - `Config/`
      - `Tools/`
    keywords:
      - `配置`
      - `导表`
      - `策划`
      - `table`
      - `config`
      - `schema`
      - `example`
      - `sample`
      - `README`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_data_config_pipeline_q10
  question: 如果项目同时存在本地模拟数据、服务端数据或外部数据源，它们与正式运行时配置的边界如何区分？
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths:
      - `Assets/`
      - `Scripts/`
      - `server/`
      - `fastapi/`
      - `mock/`
      - `test/`
      - `Tools/`
    keywords:
      - `mock`
      - `local`
      - `server`
      - `fastapi`
      - `default`
      - `fixture`
      - `testdata`
      - `dev`
      - `sample`
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
