---
name: fixed-questions-capability-tooling-and-ai-pipeline
description: 工具链与 AI Pipeline 固定问题模板
matrix_id: capability.tooling_and_ai_pipeline
axis: capability
capability: tooling_and_ai_pipeline
capability_id: tooling_and_ai_pipeline
owner: researcher-infra
question_set_id: qs-common-tooling-and-ai-pipeline
scope:
  - agent-inject
---

## 填写说明

- 本文件是 capability.tooling_and_ai_pipeline 的固定问题模板。
- 补充 MCP、Agent、工程工具链、自动化和 AI workflow 上的固定问题。
- 后续填写时，只写该 capability 自己必须回答的问题，不要把引擎主线问题写进来。

## 固定问题

- id: capability_tooling_and_ai_pipeline_q1
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

- id: capability_tooling_and_ai_pipeline_q2
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

- id: capability_tooling_and_ai_pipeline_q3
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
