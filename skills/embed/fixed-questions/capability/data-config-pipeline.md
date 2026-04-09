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
  question: TODO
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths: []
    keywords: []
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_data_config_pipeline_q2
  question: TODO
  must_find: true
  fatal_if_missing: false
  search_hints:
    paths: []
    keywords: []
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation

- id: capability_data_config_pipeline_q3
  question: TODO
  must_find: false
  fatal_if_missing: false
  search_hints:
    paths: []
    keywords: []
  report_fields:
    - evidence_paths
    - matched_strings
    - implementation
