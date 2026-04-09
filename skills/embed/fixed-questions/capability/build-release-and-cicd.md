---
name: fixed-questions-capability-build-release-and-cicd
description: 构建发布与 CI/CD 固定问题模板
matrix_id: capability.build_release_and_cicd
axis: capability
capability: build_release_and_cicd
capability_id: build_release_and_cicd
owner: researcher-infra
question_set_id: qs-common-build-release-and-cicd
scope:
  - agent-inject
---

## 填写说明

- 本文件是 capability.build_release_and_cicd 的固定问题模板。
- 补充构建、打包、发布、热更产物生成和流水线上的固定问题。
- 后续填写时，只写该 capability 自己必须回答的问题，不要把引擎主线问题写进来。

## 固定问题

- id: capability_build_release_and_cicd_q1
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

- id: capability_build_release_and_cicd_q2
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

- id: capability_build_release_and_cicd_q3
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
